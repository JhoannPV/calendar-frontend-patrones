import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import type { ErrorResponse, RootState } from ".";
<<<<<<< HEAD
import {
  onAddNewEvent,
  onDeleteEvent,
  onLoadEvents,
  onSetActiveEvent,
  onUpdateEvent,
  onDeleteEventById,
} from "../store";
=======
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent, onDeleteEventById, onPushUndoNotification, onRemoveUndoNotification, onRemoveEventsByIds, onClearDeletedEvents } from "../store";
>>>>>>> 6eca715b7a339172d0b52a8d46868c7a7c9ae11c
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
<<<<<<< HEAD
  const api = CalendarApi.getInstance();
  const dispatch = useDispatch();
  const { events, activeEvent } = useSelector((state: RootState) => state.calendar);
=======
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

                const recreated = await receiver.createEvent({
                    ...original,
                    padre: remappedParentId,
                });

                if (original.id && recreated.id) {
                    createdIdMap.set(original.id, recreated.id);
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
            const restored = await receiver.updateEvent(previousEvent);
            dispatch(onUpdateEvent(restored));
            await startLoadingEvents();
            return;
        }

        if (notification.action === 'delete-cascade') {
            await recreateCascade(notification.events);
            await startLoadingEvents();
            return;
        }

        const deletedEvent = notification.events[0];
        await receiver.createEvent(deletedEvent);
        await startLoadingEvents();
    };
>>>>>>> 6eca715b7a339172d0b52a8d46868c7a7c9ae11c

  const setActiveEvent = (calendarEvent: CalendarCompleteEventData | null) => {
    dispatch(onSetActiveEvent(calendarEvent));
  };

<<<<<<< HEAD
  const startSavingEvent = async (calendarEvent: CalendarCompleteEventData) => {
    try {
      const payload = {
        ...calendarEvent,
        parentId: calendarEvent.padre ?? null,
      };

      if (calendarEvent.id) {
        const { data } = await api.put(`/events/update-event/${calendarEvent.id}`, payload);
=======
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
                const created = await receiver.createEvent(calendarEvent);
                dispatch(onAddNewEvent(created));
            }
>>>>>>> 6eca715b7a339172d0b52a8d46868c7a7c9ae11c

        dispatch(
          onUpdateEvent(
            remapPadre({
              ...data.event,
              start: data.event.start ? new Date(data.event.start) : null,
              end: data.event.end ? new Date(data.event.end) : null,
            })
          )
        );

        const notifications = (data.notifications ?? [])
          .map((n: { observer: string; status: string }) => `• ${n.observer} (${n.status})`)
          .join("<br>");

<<<<<<< HEAD
        Swal.fire(
          "Evento actualizado",
          notifications
            ? `Patrón Observer activado.<br><br>Observers notificados:<br>${notifications}`
            : "Evento actualizado correctamente",
          "success"
        );
      } else {
        const { data } = await api.post("/events/create-event", payload);

        dispatch(
          onAddNewEvent(
            remapPadre({
              ...data.event,
              start: data.event.start ? new Date(data.event.start) : null,
              end: data.event.end ? new Date(data.event.end) : null,
            })
          )
        );
=======
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
>>>>>>> 6eca715b7a339172d0b52a8d46868c7a7c9ae11c

        const notifications = (data.notifications ?? [])
          .map((n: { observer: string; status: string }) => `• ${n.observer} (${n.status})`)
          .join("<br>");

<<<<<<< HEAD
        Swal.fire(
          "Evento creado",
          notifications
            ? `Patrón Observer activado.<br><br>Observers notificados:<br>${notifications}`
            : "Evento creado correctamente",
          "success"
        );
      }

      await startLoadingEvents();
    } catch (error) {
      const { response } = error as ErrorResponse;
      Swal.fire("Error al guardar", response?.data?.error ?? "Ocurrió un error", "error");
    }
  };

  const startDeletingEvent = async () => {
    try {
      const activeEventId = activeEvent as CalendarCompleteEventData | null;
      const { data } = await api.delete(`/events/delete-event/${activeEventId?.id}`);

      dispatch(onDeleteEvent());
      await startLoadingEvents();

      const notifications = (data.notifications ?? [])
        .map((n: { observer: string; status: string }) => `• ${n.observer} (${n.status})`)
        .join("<br>");

      Swal.fire(
        "Evento eliminado",
        notifications
          ? `Patrón Observer activado.<br><br>Observers notificados:<br>${notifications}`
          : data.msg ?? "Evento eliminado correctamente",
        "success"
      );
    } catch (error) {
      const { response } = error as ErrorResponse;
      Swal.fire("Error al eliminar", response?.data?.error ?? "Ocurrió un error", "error");
    }
  };

  const startDeletingEventById = async (eventId: string) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar evento?",
      text: "Si es un evento mayor, sus sub-eventos también serán eliminados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const { data } = await api.delete(`/events/delete-event/${eventId}`);
      dispatch(onDeleteEventById(eventId));
      await startLoadingEvents();

      Swal.fire("Eliminado", data.msg ?? "Evento eliminado correctamente", "success");
    } catch (error) {
      const { response } = error as ErrorResponse;
      Swal.fire("Error al eliminar", response?.data?.error ?? "Ocurrió un error", "error");
    }
  };

  const startLoadingEvents = useCallback(async () => {
    try {
      const { data } = await api.get("/events/get-events");

      const events: CalendarCompleteEventData[] = (
        convertEventsToDateEvents(data) as EventFromApi[]
      ).map(remapPadre);

      dispatch(onLoadEvents(events));
    } catch (error) {
      console.log(error);
    }
  }, [api, dispatch]);

  return {
    events,
    activeEvent,
    hasEventSelected: !!activeEvent,
    setActiveEvent,
    startSavingEvent,
    startDeletingEvent,
    startDeletingEventById,
    startLoadingEvents,
  };
=======
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
            const events: CalendarCompleteEventData[] = (
                convertEventsToDateEvents(data.events) as EventFromApi[]
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
>>>>>>> 6eca715b7a339172d0b52a8d46868c7a7c9ae11c
};