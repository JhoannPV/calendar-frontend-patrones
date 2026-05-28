import { CalendarComponent, type CalendarCompleteEventData, type IThemeImplementor } from "../../..";

export class CalendarEventCardComponent extends CalendarComponent {
    private theme: IThemeImplementor;
    private event: CalendarCompleteEventData;
    private parentName?: string;

    constructor(theme: IThemeImplementor, event: CalendarCompleteEventData, parentName?: string) {
        super();
        this.theme = theme;
        this.event = event;
        this.parentName = parentName;
    }

    getTheme(): IThemeImplementor {
        return this.theme;
    }

    getEvent(): CalendarCompleteEventData {
        return this.event;
    }
    getParentName(): string | undefined {
        return this.parentName;
    }
}