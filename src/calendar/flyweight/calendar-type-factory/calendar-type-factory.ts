import { CalendarTypeFlyweight, type CategoryKey } from "../..";

export class CalendarTypeFactory {
    private readonly calendarTypes: Map<CategoryKey, CalendarTypeFlyweight> = new Map();

    getCalendarType(category: CategoryKey): CalendarTypeFlyweight {
        let calendarType = this.calendarTypes.get(category);
        if (!calendarType) {
            calendarType = new CalendarTypeFlyweight({ category });
            this.calendarTypes.set(category, calendarType);
        }
        return calendarType;
    }
}