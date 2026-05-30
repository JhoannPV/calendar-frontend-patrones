import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import type { ErrorResponse, RootState } from ".";
import {
  onAddNewEvent,
  onDeleteEvent,
  onLoadEvents,
  onSetActiveEvent,
  onUpdateEvent,
  onDeleteEventById,
} from "../store";
import type { CalendarCompleteEventData } from "../calendar";
import { convertEventsToDateEvents } from "../helpers";
import Swal from "sweetalert2";
import { CalendarApi } from "../api";

type EventFromApi = CalendarCompleteEventData & { parentId?: string | null };

const remapPadre = (event: EventFromApi): CalendarCompleteEventData => ({
  ...event,
  padre: event.parentId ?? event.padre ?? null,
});

export const useCalendarStore = () => {
  const api = CalendarApi.getInstance();
  const dispatch = useDispatch();
  const { events, activeEvent } = useSelector((state: RootState) => state.calendar);

  const setActiveEvent = (calendarEvent: CalendarCompleteEventData | null) => {
    dispatch(onSetActiveEvent(calendarEvent));
  };

  const startSavingEvent = async (calendarEvent: CalendarCompleteEventData) => {
    try {
      const payload = {
        ...calendarEvent,
        parentId: calendarEvent.padre ?? null,
      };

      if (calendarEvent.id) {
        const { data } = await api.put(`/events/update-event/${calendarEvent.id}`, payload);

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

        const notifications = (data.notifications ?? [])
          .map((n: { observer: string; status: string }) => `• ${n.observer} (${n.status})`)
          .join("<br>");

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
};