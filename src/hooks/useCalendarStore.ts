import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import type { ErrorResponse, RootState } from ".";
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent, onDeleteEventById, onPushUndoNotification, onRemoveUndoNotification, onRemoveEventsByIds, onClearDeletedEvents } from "../store";
import type { CalendarCompleteEventData } from "../calendar";
import { convertEventsToDateEvents } from "../helpers";
import Swal from "sweetalert2";
import { CalendarApi } from "../api";
import { EventsCommandReceiver, CommandManager, UpdateEventCommand, DeleteEventCommand, DeleteEventCascadeCommand } from "../calendar/command";
import type { UndoNotification } from "../store/calendar/calendarSlice";

type EventFromApi = CalendarCompleteEventData & { parentId?: string | null };

const remapPadre = (event: EventFromApi): CalendarCompleteEventData => ({
  ...event,
  padre: event.parentId ?? event.padre ?? null,
});

// Command infra (shared)
const receiver = new EventsCommandReceiver();
const commandManager = new CommandManager();

const createUndoNotification = (action: UndoNotification['action'], events: CalendarCompleteEventData[]): UndoNotification => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  action,
  events,
});

export const useCalendarStore = () => {
  const api = CalendarApi.getInstance();
  const dispatch = useDispatch();
  const { events, activeEvent, lastDeletedEvents, lastUndoAction, undoNotifications } = useSelector((state: RootState) => state.calendar);

  const recreateCascade = async (deletedEvents: CalendarCompleteEventData[]) => {
    const pending = [...deletedEvents];
    const createdIdMap = new Map<string, string>();

    while (pending.length) {
      let progressed = false;

      for (let i = pending.length - 1; i >= 0; i--) {
        const original = pending[i];
        const originalParentId = original.padre ?? null;

        if (originalParentId && !createdIdMap.has(originalParentId)) {
          continue;
        }

        const remappedParentId = originalParentId
          ? createdIdMap.get(originalParentId) ?? null
          : null;

        const created = await receiver.createEvent({
          ...original,
          padre: remappedParentId,
        });

        const recreated = created?.event ?? null;

        if (original.id && recreated?.id) {
          createdIdMap.set(original.id, recreated.id);
        }

        if (recreated) {
          dispatch(onAddNewEvent(recreated));
        }

        pending.splice(i, 1);
        progressed = true;
      }

      if (!progressed) {
        throw new Error('Unable to restore cascade events due to parent dependency mismatch');
      }
    }
  };

  const applyUndoNotification = async (notification: UndoNotification) => {
    if (!notification.events.length) return;

    if (notification.action === 'update') {
      const previousEvent = notification.events[0];
      const restoredRes = await receiver.updateEvent(previousEvent);
      const restored = restoredRes?.event ?? null;
      if (restored) dispatch(onUpdateEvent(restored));
      return;
    }

    if (notification.action === 'delete-cascade') {
      await recreateCascade(notification.events);
      return;
    }

    const deletedEvent = notification.events[0];
    const restoredRes = await receiver.createEvent(deletedEvent);
    const restored = restoredRes?.event ?? null;
    if (restored) dispatch(onAddNewEvent(restored));
  };

  const setActiveEvent = (calendarEvent: CalendarCompleteEventData | null) => {
    dispatch(onSetActiveEvent(calendarEvent));
  };

  const startSavingEvent = async (calendarEvent: CalendarCompleteEventData) => {
    try {
      if (calendarEvent.id) {
        // Use Command pattern for updates
        const previous = (activeEvent as CalendarCompleteEventData) ?? events.find((e: CalendarCompleteEventData) => e.id === calendarEvent.id) ?? calendarEvent;
        const cmd = new UpdateEventCommand(receiver, previous, calendarEvent);
        // register and execute
        commandManager.add("update-event", cmd);
        const updated = await commandManager.select("update-event");
        if (updated) {
          const notification = createUndoNotification('update', [previous]);
          dispatch(onPushUndoNotification(notification));
          dispatch(onUpdateEvent(updated));
        }
      } else {
        const createdRes = await receiver.createEvent(calendarEvent);
        const created = createdRes?.event ?? null;
        if (created) dispatch(onAddNewEvent(created));
      }

    } catch (error) {
      const { response } = error as ErrorResponse;
      Swal.fire('Error al guardar', response.data?.error, 'error');
    }
  };

  // Elimina el activeEvent (usado desde CalendarPage con FabDelete)
  const startDeletingEvent = async () => {
    try {
      const activeEventId = (activeEvent as CalendarCompleteEventData | null)?.id;
      if (!activeEventId) return;

      const cmd = new DeleteEventCommand(receiver, activeEventId);
      commandManager.add("delete-event", cmd);
      await commandManager.select("delete-event");

      // snapshot for undo
      const snapshot = cmd.getDeletedEvent();
      if (snapshot) dispatch(onPushUndoNotification(createUndoNotification('delete', [snapshot])));

      dispatch(onDeleteEvent());
    } catch (error) {
      const { response } = error as ErrorResponse;
      Swal.fire('Error al Eliminar', response.data?.error, 'error');
    }
  };

  // Elimina solo un evento puntual (hijo o independiente)
  const startDeletingEventById = async (eventId: string) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar este evento?',
      text: 'Se eliminará solo este evento.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    try {
      const cmd = new DeleteEventCommand(receiver, eventId);
      commandManager.add("delete-event", cmd);
      await commandManager.select("delete-event");

      const snapshot = cmd.getDeletedEvent();
      if (snapshot) dispatch(onPushUndoNotification(createUndoNotification('delete', [snapshot])));

      // Eliminar del store el evento y todos sus posibles hijos
      dispatch(onDeleteEventById(eventId));
    } catch (error) {
      const { response } = error as ErrorResponse;
      Swal.fire('Error al Eliminar', response.data?.error, 'error');
    }
  };

  // Elimina en cascada al evento padre y sus descendientes
  const startDeletingEventCascade = async (eventId: string) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar evento y todos sus sub-eventos?',
      text: 'Esta acción borrará el evento y todos sus descendientes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    try {
      const cmd = new DeleteEventCascadeCommand(receiver, eventId);
      commandManager.add("delete-event-cascade", cmd);
      await commandManager.select("delete-event-cascade");

      const deleted = cmd.getDeletedEvents();
      dispatch(onPushUndoNotification(createUndoNotification('delete-cascade', deleted)));

      const ids = deleted.map(d => d.id!).filter(Boolean) as string[];
      dispatch(onRemoveEventsByIds(ids));
    } catch (error) {
      const { response } = error as ErrorResponse;
      Swal.fire('Error al Eliminar', response.data?.error, 'error');
    }
  };

  const undoLastAction = async () => {
    const lastNotification = undoNotifications[undoNotifications.length - 1];
    if (!lastNotification) return;

    try {
      await applyUndoNotification(lastNotification);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(onRemoveUndoNotification(lastNotification.id));
      commandManager.clear();
    }
  };

  const undoNotification = async (notificationId: string) => {
    const notification = undoNotifications.find((item: UndoNotification) => item.id === notificationId);
    if (!notification) return;

    try {
      await applyUndoNotification(notification);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(onRemoveUndoNotification(notificationId));
      commandManager.clear();
    }
  };

  const clearUndoState = (notificationId?: string) => {
    commandManager.clear();
    if (notificationId) {
      dispatch(onRemoveUndoNotification(notificationId));
      return;
    }

    dispatch(onClearDeletedEvents());
  };

  const startLoadingEvents = useCallback(async () => {
    try {
      const { data } = await api.get('/events/get-events');
      // Backend may return either an array or an object with `events` key.
      const rawEvents = Array.isArray(data) ? data : (Array.isArray(data?.events) ? data.events : []);
      const events: CalendarCompleteEventData[] = (
        convertEventsToDateEvents(rawEvents) as EventFromApi[]
      ).map(remapPadre);
      dispatch(onLoadEvents(events));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    events,
    activeEvent,
    hasEventSelected: !!activeEvent,
    setActiveEvent,
    startSavingEvent,
    startDeletingEvent,
    startDeletingEventById,
    startDeletingEventCascade,
    undoLastAction,
    undoNotification,
    clearUndoState,
    lastDeletedEvents,
    lastUndoAction,
    undoNotifications,
    startLoadingEvents,
  };
};