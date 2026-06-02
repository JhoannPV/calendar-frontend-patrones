import { CalendarTypeFlyweight, type ICalendarTypeFlyweight } from "../..";

const buildCalendarTypeKey = (data: ICalendarTypeFlyweight): string => {
    return `${data.category}:${data.reminderStrategy}`;
};

export class CalendarTypeFactory {
    private readonly calendarTypes: Map<string, CalendarTypeFlyweight> = new Map();

    getCalendarType(data: ICalendarTypeFlyweight): CalendarTypeFlyweight {
        const key = buildCalendarTypeKey(data);
        let calendarType = this.calendarTypes.get(key);
        if (!calendarType) {
            calendarType = new CalendarTypeFlyweight(data);
            this.calendarTypes.set(key, calendarType);
        }
        return calendarType;
    }
}