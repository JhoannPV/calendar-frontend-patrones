import { CalendarApi } from "../../api";
import type { CalendarCompleteEventData } from "../types/CalendarTypes";
import type { DeleteCascadeResult, DeleteSingleResult } from "../types/events-command.types";

export class EventsCommandReceiver {
    private readonly api = CalendarApi.getInstance();

    private mapFromApi(event: Partial<CalendarCompleteEventData>): CalendarCompleteEventData {
        const parentId = (event as Partial<CalendarCompleteEventData> & { parentId?: string | null }).parentId;

        return {
            ...(event as CalendarCompleteEventData),
            padre: event.padre ?? parentId ?? null,
            start: event.start ? new Date(event.start as string | Date) : null,
            end: event.end ? new Date(event.end as string | Date) : null,
        };
    }

    private toApiPayload(event: CalendarCompleteEventData): Record<string, unknown> {
        return {
            ...event,
            parentId: event.padre ?? null,
        };
    }

    async updateEvent(event: CalendarCompleteEventData): Promise<CalendarCompleteEventData> {
        if (!event.id) throw new Error("Cannot update event without id");
        const { data } = await this.api.put(`/events/update-event/${event.id}`, this.toApiPayload(event));
        return this.mapFromApi(data.event as Partial<CalendarCompleteEventData>);
    }

    async createEvent(event: CalendarCompleteEventData): Promise<CalendarCompleteEventData> {
        const { data } = await this.api.post("/events/create-event", this.toApiPayload(event));
        return this.mapFromApi(data.event as Partial<CalendarCompleteEventData>);
    }

    async deleteEventById(eventId: string): Promise<DeleteSingleResult> {
        const { data } = await this.api.delete(`/events/delete-event/${eventId}`);

        const entity = data?.event?.event as Partial<CalendarCompleteEventData> | undefined;
        return {
            message: data?.event?.msg ?? "Event deleted",
            deletedEvent: entity ? this.mapFromApi(entity) : null,
        };
    }

    async deleteEventCascade(eventId: string): Promise<DeleteCascadeResult> {
        const { data } = await this.api.delete(`/events/delete-event-cascade/${eventId}`);

        return {
            message: data?.msg ?? "Events deleted",
            deletedEvents: ((data?.events ?? []) as Partial<CalendarCompleteEventData>[]).map((ev) => this.mapFromApi(ev)),
        };
    }
}
