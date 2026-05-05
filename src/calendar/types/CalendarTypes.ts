export const categories = {
    general: 'General',
    work:    'Trabajo',
    sports:  'Deportes',
    family:  'Familia',
    travel:  'Viajes',
} as const;

export type CategoryKey = keyof typeof categories;

export interface User {
    _id: string;
    name: string;
}

// Datos básicos que el Builder maneja
export interface CalendarEventData {
    id?: string;
    title: string;
    notes: string;
    start: Date | string;
    end: Date | string;
    bgColor?: string;
    user?: User;
    padre?: string | null;  // COMPOSITE
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
