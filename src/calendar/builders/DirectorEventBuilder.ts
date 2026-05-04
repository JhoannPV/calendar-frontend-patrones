import { EventBuilder } from "..";

export class DirectorEventBuilder {
    static createEventComplete: any;
    createEventComplete() {
        return new EventBuilder()
    }
}