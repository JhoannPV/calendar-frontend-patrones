// src/calendar/composite/calendar-event-leaf.ts

import type { CalendarCompleteEventData } from '../types/CalendarTypes';
import type { ICalendarComponent } from './calendar-component.interface';

export class CalendarEventLeaf implements ICalendarComponent {
  readonly event: CalendarCompleteEventData;    // ← declarado aparte

  constructor(event: CalendarCompleteEventData) {
    this.event = event;                         // ← asignado en el cuerpo
  }

  getTitle(): string {
    return this.event.title;
  }

  getDurationMinutes(): number {
    const start = new Date(this.event.start).getTime();
    const end = new Date(this.event.end).getTime();
    return Math.round((end - start) / 60000);
  }

  getChildCount(): number {
    return 0;
  }

  isComposite(): boolean {
    return false;
  }
}