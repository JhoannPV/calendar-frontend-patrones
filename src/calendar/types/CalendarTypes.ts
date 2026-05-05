export interface User {
    id: string;
    name: string;
}

// src/calendar/types/CalendarTypes.ts
export interface CalendarEventData {
    id?:      string;
    title:    string;
    notes:    string;
    start:    Date | string | null;
    end:      Date | string | null;
    bgColor?: string;
    category: string;
    padre?:   string | null;
    user?: {
        id:    string;
        name:  string;
    };
}

export interface CalendarCompleteEventData {
    id?: string;
    title: string;
    notes: string;
    start: Date | string;
    end: Date | string;
    bgColor?: string;
    user?: User;
    category: CategoryKey;
    padre?: string | null;  // COMPOSITE
}

export const categories = {
    general: 'General',
    work: 'Trabajo',
    sports: 'Deportes',
    family: 'Familia',
    travel: 'Viajes',
} as const;

export type CategoryKey = keyof typeof categories;
