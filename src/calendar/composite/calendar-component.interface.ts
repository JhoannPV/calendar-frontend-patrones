// src/calendar/composite/calendar-component.interface.ts

export interface ICalendarComponent {
  getTitle(): string;
  getDurationMinutes(): number;
  getChildCount(): number;
  isComposite(): boolean;
}