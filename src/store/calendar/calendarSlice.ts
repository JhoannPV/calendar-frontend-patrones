import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CalendarCompleteEventData } from '../../calendar';

interface CalendarState {
    events: CalendarCompleteEventData[];
    activeEvent: CalendarCompleteEventData | null;
    lastDeletedEvents: CalendarCompleteEventData[] | null;
    lastUndoAction: 'delete' | 'update' | 'delete-cascade' | null;
    undoNotifications: UndoNotification[];
}

export interface UndoNotification {
    id: string;
    action: 'delete' | 'update' | 'delete-cascade';
    events: CalendarCompleteEventData[];
}

const initialState: CalendarState = {
    events: [],
    activeEvent: null,
    lastDeletedEvents: null,
    lastUndoAction: null,
    undoNotifications: [],
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

        // Guarda el arreglo de eventos eliminados (para undo futuro)
        onSetDeletedEvents: (state, { payload }: PayloadAction<CalendarCompleteEventData[]>) => {
            state.lastDeletedEvents = payload;
        },

        onPushUndoNotification: (state, { payload }: PayloadAction<UndoNotification>) => {
            state.undoNotifications.push(payload);
            state.lastDeletedEvents = payload.events;
            state.lastUndoAction = payload.action;
        },

        onRemoveUndoNotification: (state, { payload: notificationId }: PayloadAction<string>) => {
            state.undoNotifications = state.undoNotifications.filter(item => item.id !== notificationId);
        },

        // Guarda el tipo de acción que se puede deshacer
        onSetUndoAction: (state, { payload }: PayloadAction<'delete' | 'update' | 'delete-cascade'>) => {
            state.lastUndoAction = payload;
        },

        // Limpia el arreglo de eventos eliminados
        onClearDeletedEvents: (state) => {
            state.lastDeletedEvents = null;
            state.lastUndoAction = null;
            state.undoNotifications = [];
        },

        // Elimina múltiples eventos por id
        onRemoveEventsByIds: (state, { payload: ids }: PayloadAction<string[]>) => {
            const idSet = new Set(ids);
            state.events = state.events.filter(e => !idSet.has(e.id ?? ''));
            if (state.activeEvent && idSet.has(state.activeEvent.id ?? '')) {
                state.activeEvent = null;
            }
        },

        onLoadEvents: (state, { payload }: PayloadAction<CalendarCompleteEventData[]>) => {
            state.events = payload;
            state.activeEvent = null;
        },

        // Limpia todo al hacer logout
        onLogoutCalendar: (state) => {
            state.events = [];
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
    onSetDeletedEvents,
    onPushUndoNotification,
    onRemoveUndoNotification,
    onSetUndoAction,
    onClearDeletedEvents,
    onRemoveEventsByIds,
    onLoadEvents,
    onLogoutCalendar,
} = calendarSlice.actions;