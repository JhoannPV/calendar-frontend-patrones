import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CalendarCompleteEventData } from '../../calendar';

interface CalendarState {
    events:      CalendarCompleteEventData[];
    activeEvent: CalendarCompleteEventData | null;
}

const initialState: CalendarState = {
    events:      [],
    activeEvent: null,
};

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {

        onSetActiveEvent: (state, { payload }: PayloadAction<CalendarCompleteEventData | null>) => {
            state.activeEvent = payload;
        },

        onAddNewEvent: (state, { payload }: PayloadAction<CalendarCompleteEventData>) => {
            state.events.push(payload);
            state.activeEvent = null;
        },

        onUpdateEvent: (state, { payload }: PayloadAction<CalendarCompleteEventData>) => {
            state.events = state.events.map(event =>
                event.id === payload.id ? payload : event
            );
        },

        // Elimina el activeEvent del store (FabDelete en CalendarPage)
        onDeleteEvent: (state) => {
            if (state.activeEvent) {
                const deletedId = (state.activeEvent as CalendarCompleteEventData).id;
                state.events = state.events.filter(e =>
                    e.id !== deletedId && e.padre !== deletedId
                );
            }
            state.activeEvent = null;
        },

        // Elimina por ID + hijos en cascada (MyEventsPage)
        onDeleteEventById: (state, { payload: eventId }: PayloadAction<string>) => {
            state.events = state.events.filter(e =>
                e.id !== eventId && e.padre !== eventId
            );
            if ((state.activeEvent as CalendarCompleteEventData | null)?.id === eventId) {
                state.activeEvent = null;
            }
        },

        onLoadEvents: (state, { payload }: PayloadAction<CalendarCompleteEventData[]>) => {
            state.events      = payload;
            state.activeEvent = null;
        },

        // Limpia todo al hacer logout
        onLogoutCalendar: (state) => {
            state.events      = [];
            state.activeEvent = null;
        },
    },
});

export const {
    onSetActiveEvent,
    onAddNewEvent,
    onUpdateEvent,
    onDeleteEvent,
    onDeleteEventById,
    onLoadEvents,
    onLogoutCalendar,
} = calendarSlice.actions;