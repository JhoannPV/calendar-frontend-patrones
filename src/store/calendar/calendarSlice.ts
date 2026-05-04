import { createSlice } from '@reduxjs/toolkit';
import type { CalendarCompleteEventData } from '../../calendar';

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState: {
        isLoadingEvents: true,
        events: [] as CalendarCompleteEventData[],
        activeEvent: null,
    },
    reducers: {
        onSetActiveEvent: (state, { payload }) => {
            state.activeEvent = payload;
        },

        onAddNewEvent: (state, { payload }) => {
            state.events.push(payload);
            state.activeEvent = null;
        },

        onUpdateEvent: (state, { payload }) => {
            // CORREGIDO: comparar por id (sin guión bajo)
            state.events = state.events.map(event =>
                event.id === payload.id ? payload : event
            );
        },

        onDeleteEvent: (state) => {
            if (state.activeEvent) {
                const active = state.activeEvent as CalendarCompleteEventData;
                // CORREGIDO: comparar por id (sin guión bajo)
                state.events = state.events.filter(event => event.id !== active.id);
                state.activeEvent = null;
            }
        },

        onLoadEvents: (state, { payload = [] }) => {
            state.isLoadingEvents = false;
            // CORREGIDO: reemplaza todo en vez de hacer push
            // así no hay duplicados al recargar la página
            state.events = payload;
        },

        onLogoutCalendar: (state) => {
            state.isLoadingEvents = true;
            state.events = [];
            state.activeEvent = null;
        }
    }
});

export const {
    onSetActiveEvent,
    onAddNewEvent,
    onUpdateEvent,
    onDeleteEvent,
    onLoadEvents,
    onLogoutCalendar
} = calendarSlice.actions;