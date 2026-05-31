import { parseISO } from 'date-fns';

type ApiEvent = { start?: string | null; end?: string | null } & Record<string, unknown>;

export const convertEventsToDateEvents = (events: ApiEvent[]) => {
    return events.map(event => ({
        ...event,
        // Si start/end son null (evento padre) → se dejan como null
        start: event.start ? parseISO(String(event.start)) : null,
        end: event.end ? parseISO(String(event.end)) : null,
    }));
};
