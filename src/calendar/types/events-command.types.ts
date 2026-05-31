import type { CalendarCompleteEventData } from "./CalendarTypes";

export interface DeleteSingleResult {
    message: string;
    deletedEvent: CalendarCompleteEventData | null;
}

export interface DeleteCascadeResult {
    message: string;
    deletedEvents: CalendarCompleteEventData[];
}
