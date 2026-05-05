export const categories = {
    general: 'General',
    work:    'Trabajo',
    sports:  'Deportes',
    family:  'Familia',
    travel:  'Viajes',
} as const;

export type CategoryKey = keyof typeof categories;

export interface User {
    id:   string;
    name: string;
}

// Datos básicos que el Builder maneja
export interface CalendarEventData {
    id?:      string;
    title:    string;
    notes:    string;
    // Nullable: los eventos padre NO tienen fechas
    start:    Date | string | null;
    end:      Date | string | null;
    bgColor?: string;
    user?:    { _id?: string; id?: string; name: string };
    padre?:   string | null;
}

// Flyweight añade category
export interface CalendarTypeFlyweight {
    readonly category: CategoryKey;
}

// Dato completo que viaja al store y a la API
export interface CalendarCompleteEventData extends CalendarEventData {
    category: CategoryKey | string;
}