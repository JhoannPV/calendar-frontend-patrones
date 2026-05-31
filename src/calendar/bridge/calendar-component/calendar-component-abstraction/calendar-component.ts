import type { IThemeImplementor } from "../../..";

export abstract class CalendarComponent {
    abstract getTheme(): IThemeImplementor;
}