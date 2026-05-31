import type { CalendarCompleteEventData } from "../types/CalendarTypes";
import type { CommandEvent } from "./command-event.interface";
import { EventsCommandReceiver } from "./events-command.receiver";

export class UpdateEventCommand implements CommandEvent {
  constructor(
    private readonly receiver: EventsCommandReceiver,
    private readonly previousEvent: CalendarCompleteEventData,
    private readonly nextEvent: CalendarCompleteEventData,
  ) { }

  async execute(): Promise<CalendarCompleteEventData | null> {
    const res = await this.receiver.updateEvent(this.nextEvent);
    return res?.event ?? null;
  }

  async undo(): Promise<CalendarCompleteEventData | null> {
    const res = await this.receiver.updateEvent(this.previousEvent);
    return res?.event ?? null;
  }
}