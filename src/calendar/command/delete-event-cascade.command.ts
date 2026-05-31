import type { CalendarCompleteEventData } from "../types/CalendarTypes";
import type { CommandEvent } from "./command-event.interface";
import { EventsCommandReceiver } from "./events-command.receiver";

export class DeleteEventCascadeCommand implements CommandEvent {
  private deletedEvents: CalendarCompleteEventData[] = [];

  constructor(
    private readonly receiver: EventsCommandReceiver,
    private readonly eventId: string,
  ) { }

  async execute(): Promise<CalendarCompleteEventData | null> {
    const res = await this.receiver.deleteEventCascade(this.eventId);
    this.deletedEvents = res.deletedEvents ?? [];
    // return the root deleted event (the one matching eventId) if present
    return this.deletedEvents.find(e => e.id === this.eventId) ?? null;
  }

  async undo(): Promise<CalendarCompleteEventData | null> {
    if (!this.deletedEvents.length) return null;

    const pending = [...this.deletedEvents];
    const createdIdMap = new Map<string, string>();
    let recreatedRoot: CalendarCompleteEventData | null = null;

    // Recreate preserving hierarchy: parent first, then children.
    while (pending.length) {
      let progressed = false;

      for (let i = pending.length - 1; i >= 0; i--) {
        const original = pending[i]!;
        const originalParentId = original.padre ?? null;

        if (originalParentId && !createdIdMap.has(originalParentId)) {
          continue;
        }

        const remappedParentId = originalParentId
          ? createdIdMap.get(originalParentId) ?? null
          : null;

        const recreated = await this.receiver.createEvent({
          ...original,
          padre: remappedParentId,
        });

        if (original.id && recreated.id) {
          createdIdMap.set(original.id, recreated.id);
        }

        // capture recreated root if this original was the root
        if (original.id === this.eventId) recreatedRoot = recreated;

        pending.splice(i, 1);
        progressed = true;
      }

      if (!progressed) {
        throw new Error("Unable to restore cascade events due to parent dependency mismatch");
      }
    }

    return recreatedRoot;
  }

  // expose deleted events array for callers
  getDeletedEvents(): CalendarCompleteEventData[] {
    return this.deletedEvents;
  }
}