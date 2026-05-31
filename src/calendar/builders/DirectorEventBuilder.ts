import { EventBuilder } from "..";

export class DirectorEventBuilder {
    createEventComplete(): EventBuilder {
        return new EventBuilder();
    }
}