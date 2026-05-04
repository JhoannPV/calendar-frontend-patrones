// src/calendar/composite/calendar-node.interface.ts
import type { CalendarCompleteEventData } from '../types/CalendarTypes';

export interface ICalendarNode {
  getData(): CalendarCompleteEventData;
  getChildren(): ICalendarNode[];
  isComposite(): boolean;
}