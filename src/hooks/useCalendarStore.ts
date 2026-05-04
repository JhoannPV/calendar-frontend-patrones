import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import type { ErrorResponse, RootState } from ".";
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent } from "../store";
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
            // COMPOSITE — remap padre (frontend) → parentId (backend)
            const payload = {
                ...calendarEvent,
                parentId: calendarEvent.padre ?? null,
            };

            if (calendarEvent.id) {
                const { data } = await api.put(`/events/update-event/${calendarEvent.id}`, payload);
                dispatch(onUpdateEvent(remapPadre({
                    ...data.event,
                    start: new Date(data.event.start),
                    end:   new Date(data.event.end),
                })));
            } else {
                const { data } = await api.post('/events/create-event', payload);
                dispatch(onAddNewEvent(remapPadre({
                    ...data.event,
                    start: new Date(data.event.start),
                    end:   new Date(data.event.end),
                })));
            }
        } catch (error) {
            const { response } = error as ErrorResponse;
            Swal.fire('Error al guardar', response.data?.error, 'error');
        }
    };

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
        startLoadingEvents,
    };
};