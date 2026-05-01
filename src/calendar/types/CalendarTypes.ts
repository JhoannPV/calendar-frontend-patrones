export interface User {
    _id: string;
    name: string;
}
export interface CalendarEventData {
    _id?: string;
    title: string;
    notes: string;
    start: Date | string;
    end: Date | string;
    bgColor?: string;
    user?: User;
}

export interface CalendarCompleteEventData {
    _id?: string;
    title: string;
    notes: string;
    start: Date | string;
    end: Date | string;
    bgColor?: string;
    user?: User;
    category: CategoryKey;
}

export const categories = {
    general: 'General',
    work: 'Trabajo',
    sports: 'Deportes',
    family: 'Familia',
    travel: 'Viajes',
} as const;

export type CategoryKey = keyof typeof categories;