import type { CalendarCompleteEventData } from "../types/CalendarTypes";

export interface CommandEvent {
    execute(): Promise<CalendarCompleteEventData | null>;
    undo(): Promise<CalendarCompleteEventData | null>;
}
