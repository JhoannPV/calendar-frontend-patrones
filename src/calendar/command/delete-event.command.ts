import type { CalendarCompleteEventData } from "../types/CalendarTypes";
import type { CommandEvent } from "./command-event.interface";
import { EventsCommandReceiver } from "./events-command.receiver";

export class DeleteEventCommand implements CommandEvent {
  private deletedEvent: CalendarCompleteEventData | null = null;

  constructor(
    private readonly receiver: EventsCommandReceiver,
    private readonly eventId: string,
  ) { }

  async execute(): Promise<CalendarCompleteEventData | null> {
    const res = await this.receiver.deleteEventById(this.eventId);
    this.deletedEvent = res.deletedEvent ?? null;
    return this.deletedEvent;
  }

  async undo(): Promise<CalendarCompleteEventData | null> {
    if (!this.deletedEvent) return null;
    const res = await this.receiver.createEvent(this.deletedEvent);
    return res?.event ?? null;
  }

  // expose deleted event for callers that need the full snapshot
  getDeletedEvent(): CalendarCompleteEventData | null {
    return this.deletedEvent;
  }
}