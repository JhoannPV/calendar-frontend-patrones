import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import type { ErrorResponse, RootState } from ".";
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent, onDeleteEventById, onSetDeletedEvents, onRemoveEventsByIds } from "../store";
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
                    end: data.event.end ? new Date(data.event.end) : null,
                })));
            } else {
                const { data } = await api.post('/events/create-event', payload);
                dispatch(onAddNewEvent(remapPadre({
                    ...data.event,
                    start: data.event.start ? new Date(data.event.start) : null,
                    end: data.event.end ? new Date(data.event.end) : null,
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
            const { data } = await api.delete(`/events/delete-event/${eventId}`);
            // Eliminar del store el evento y todos sus posibles hijos
            dispatch(onDeleteEventById(eventId));
            Swal.fire('Eliminado', data.event.msg, 'success');
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
            const { data } = await api.delete(`/events/delete-event-cascade/${eventId}`);

            // data.events is an array of deleted events (decorated)
            const deleted: CalendarCompleteEventData[] = (
                (data.events ?? []) as EventFromApi[]
            ).map(ev => {
                let s: Date | null;
                if (ev.start) {
                    s = typeof ev.start === 'string' ? new Date(ev.start) : ev.start as Date;
                } else s = null;

                let e: Date | null;
                if (ev.end) {
                    e = typeof ev.end === 'string' ? new Date(ev.end) : ev.end as Date;
                } else e = null;

                return remapPadre({
                    ...ev,
                    start: s,
                    end: e,
                });
            });

            // Guardar en store el arreglo de elementos eliminados para un posible undo futuro
            dispatch(onSetDeletedEvents(deleted));

            // Eliminar los ids del store para actualizar UI inmediatamente
            const ids = deleted.map(d => d.id!).filter(Boolean) as string[];
            dispatch(onRemoveEventsByIds(ids));

            Swal.fire('Eliminados', data.msg || 'Eventos eliminados', 'success');
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
        startDeletingEventCascade,
        startLoadingEvents,
    };
};