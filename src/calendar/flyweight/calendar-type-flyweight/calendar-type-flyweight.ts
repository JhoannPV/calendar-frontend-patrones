import type { CategoryKey, ReminderStrategyKey } from "../..";

export interface ICalendarTypeFlyweight {
    readonly category: CategoryKey;
    readonly reminderStrategy: ReminderStrategyKey;
}

export class CalendarTypeFlyweight {
    private readonly data: ICalendarTypeFlyweight;

    constructor(data: ICalendarTypeFlyweight) {
        this.data = data;
    }

    getData(): ICalendarTypeFlyweight {
        return this.data;
    }
}