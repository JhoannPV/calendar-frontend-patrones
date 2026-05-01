import { parseISO } from "date-fns";
import type { CalendarCompleteEventData } from "../calendar";


export const convertEventsToDateEvents = (events: CalendarCompleteEventData[]): CalendarCompleteEventData[] => {
    return events.map(event => {
        event.start = parseISO(event.start as string);
        event.end = parseISO(event.end as string);

        return event;
    });
}
