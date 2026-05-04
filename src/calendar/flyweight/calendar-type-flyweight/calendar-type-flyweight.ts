import type { CategoryKey } from "../..";

interface ICalendarTypeFlyweight {
    readonly category: CategoryKey;
}

export class CalendarTypeFlyweight {
    getEventComplete(): CalendarTypeFlyweight {
        throw new Error('Method not implemented.');
    }
    private readonly data: ICalendarTypeFlyweight;

    constructor(data: ICalendarTypeFlyweight) {
        this.data = data;
    }

    getCategory(): ICalendarTypeFlyweight {
        return this.data;
    }
}