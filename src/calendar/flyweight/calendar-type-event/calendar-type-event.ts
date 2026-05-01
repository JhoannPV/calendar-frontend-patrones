import type { CalendarCompleteEventData, CalendarEventData, CalendarTypeFlyweight } from "../..";

export class CalendarTypeEvent {
    readonly calendarEventData: CalendarEventData;
    readonly calendarTypeFlyweight: CalendarTypeFlyweight;

    constructor(calendarEventData: CalendarEventData, calendarTypeFlyweight: CalendarTypeFlyweight) {
        this.calendarEventData = calendarEventData;
        this.calendarTypeFlyweight = calendarTypeFlyweight;
    }

    getEventComplete(): CalendarCompleteEventData {
        return {
            ...this.calendarEventData,
            category: this.calendarTypeFlyweight.getCategory().category
        }
    }
}