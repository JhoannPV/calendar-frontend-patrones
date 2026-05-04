// src/calendar/composite/leaf-node.ts
// src/calendar/composite/leaf-node.ts
import type { CalendarCompleteEventData } from '../types/CalendarTypes';
import type { ICalendarNode } from './calendar-node.interface';

export class LeafNode implements ICalendarNode {
  constructor(private readonly data: CalendarCompleteEventData) {}
  getData() { return this.data; }
  getChildren() { return []; }
  isComposite() { return false; }
}