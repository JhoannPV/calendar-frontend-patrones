import { useSelector, useDispatch } from "react-redux"
import type { ErrorResponse, RootState } from ".";
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent } from "../store";
import type { CalendarEventData } from "../calendar";
import { convertEventsToDateEvents } from "../helpers";
import Swal from "sweetalert2";
import { CalendarApi } from "../api";


export const useCalendarStore = () => {
    const api = CalendarApi.getInstance();
    const dispatch = useDispatch();
    const {
        events,
        activeEvent,
    } = useSelector((state: RootState) => state.calendar);

    const setActiveEvent = (calendarEvent: CalendarEventData | null) => {
        dispatch(onSetActiveEvent(calendarEvent));
    }

    const startSavingEvent = async (calendarEvent: CalendarEventData) => {

        try {
            if (calendarEvent._id) {
                // Actualizando
                const { data } = await api.put(`/events/update-event/${calendarEvent._id}`, calendarEvent);
                dispatch(onUpdateEvent({
                    ...data.event,
                    start: new Date(data.event.start),
                    end: new Date(data.event.end),
                }));
            } else {
                // Creando
                const { data } = await api.post('/events/create-event', calendarEvent);
                dispatch(onAddNewEvent({
                    ...data.event,
                    start: new Date(data.event.start),
                    end: new Date(data.event.end),
                }));
            }
        } catch (error) {
            const { response } = error as ErrorResponse;
            Swal.fire('Error al guardar', response.data?.error, 'error');
        }
    }

    const startDeletingEvent = async () => {
        try {
            const activeEventId = activeEvent as CalendarEventData | null;
            const { data } = await api.delete(`/events/delete-event/${activeEventId?._id}`);
            Swal.fire('Evento eliminado', data.event.msg, 'success');
            await dispatch(onDeleteEvent());
        } catch (error) {
            const { response } = error as ErrorResponse;
            Swal.fire('Error al Eliminar', response.data?.error, 'error');
        }
    }

    const startLoadingEvents = async () => {
        try {
            const { data } = await api.get('/events/get-events');
            const events: CalendarEventData[] = convertEventsToDateEvents(data.events);
            dispatch(onLoadEvents(events));

        } catch (error) {
            console.log(error);
        }
    }


    return {
        //* Propiedades
        events,
        activeEvent,
        hasEventSelected: !!activeEvent,

        //* Métodos
        setActiveEvent,
        startSavingEvent,
        startDeletingEvent,
        startLoadingEvents,
    }
}
