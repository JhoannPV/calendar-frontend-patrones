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
        return await this.receiver.updateEvent(this.nextEvent);
    }

    async undo(): Promise<CalendarCompleteEventData | null> {
        return await this.receiver.updateEvent(this.previousEvent);
    }
}
