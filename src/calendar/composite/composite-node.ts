// src/calendar/composite/composite-node.ts
// src/calendar/composite/composite-node.ts
import type { CalendarCompleteEventData } from '../types/CalendarTypes';
import type { ICalendarNode } from './calendar-node.interface';

export class CompositeNode implements ICalendarNode {
  private children: ICalendarNode[] = [];

  constructor(private readonly data: CalendarCompleteEventData) {}

  getData() { return this.data; }
  getChildren() { return this.children; }
  isComposite() { return true; }

  add(node: ICalendarNode) { this.children.push(node); }
}