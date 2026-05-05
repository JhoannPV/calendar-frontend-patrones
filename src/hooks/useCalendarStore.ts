import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import type { ErrorResponse, RootState } from ".";
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent, onDeleteEventById } from "../store";
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
                dispatch(onUpdateEvent(remapPadre({
                    ...data.event,
                    start: data.event.start ? new Date(data.event.start) : null,
                    end:   data.event.end   ? new Date(data.event.end)   : null,
                })));
            } else {
                const { data } = await api.post('/events/create-event', payload);
                dispatch(onAddNewEvent(remapPadre({
                    ...data.event,
                    start: data.event.start ? new Date(data.event.start) : null,
                    end:   data.event.end   ? new Date(data.event.end)   : null,
                })));
            }

            // 🔥 Recargar para reflejar el árbol completo actualizado
            await startLoadingEvents();

        } catch (error) {
            const { response } = error as ErrorResponse;
            Swal.fire('Error al guardar', response.data?.error, 'error');
        }
    };

    // Elimina el activeEvent (usado desde CalendarPage con FabDelete)
    const startDeletingEvent = async () => {
        try {
            const activeEventId = activeEvent as CalendarCompleteEventData | null;
            const { data } = await api.delete(`/events/delete-event/${activeEventId?.id}`);
            Swal.fire('Evento eliminado', data.event.msg, 'success');
            dispatch(onDeleteEvent());
        } catch (error) {
            const { response } = error as ErrorResponse;
            Swal.fire('Error al Eliminar', response.data?.error, 'error');
        }
    };

    // Elimina por ID directamente — usado desde MyEventsPage para padres e hijos
    const startDeletingEventById = async (eventId: string) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar evento?',
            text: 'Si es un evento mayor, sus sub-eventos también serán eliminados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!confirm.isConfirmed) return;

        try {
            const { data } = await api.delete(`/events/delete-event/${eventId}`);
            // Eliminar del store el evento y todos sus posibles hijos
            dispatch(onDeleteEventById(eventId));
            Swal.fire('Eliminado', data.event.msg, 'success');
        } catch (error) {
            const { response } = error as ErrorResponse;
            Swal.fire('Error al Eliminar', response.data?.error, 'error');
        }
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
        startLoadingEvents,
    };
};