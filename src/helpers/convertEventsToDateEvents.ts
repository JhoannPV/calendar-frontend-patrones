import { parseISO } from 'date-fns';

export const convertEventsToDateEvents = (events: { [key: string]: any }[]) => {
    return events.map(event => ({
        ...event,
        // Si start/end son null (evento padre) → se dejan como null
        start: event.start ? parseISO(event.start) : null,
        end:   event.end   ? parseISO(event.end)   : null,
    }));
};
