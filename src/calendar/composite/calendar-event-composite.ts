// src/calendar/composite/calendar-event-composite.ts

import type { ICalendarComponent } from './calendar-component.interface';
import { CalendarEventLeaf } from './calendar-event-leaf';
import type { CalendarCompleteEventData } from '../types/CalendarTypes';
import { categories, type CategoryKey } from '../types/CalendarTypes';

export class CalendarEventComposite implements ICalendarComponent {
  readonly label: string;                        // ← declarado aparte
  private children: ICalendarComponent[] = [];

  constructor(label: string) {
    this.label = label;                          // ← asignado en el cuerpo
  }

  add(component: ICalendarComponent): void {
    this.children.push(component);
  }

  getChildren(): ICalendarComponent[] {
    return this.children;
  }

  getTitle(): string {
    return this.label;
  }

  getDurationMinutes(): number {
    return this.children.reduce((acc, child) => acc + child.getDurationMinutes(), 0);
  }

  getChildCount(): number {
    return this.children.length;
  }

  isComposite(): boolean {
    return true;
  }

  static buildFromEvents(events: CalendarCompleteEventData[]): CalendarEventComposite {
    const root = new CalendarEventComposite('Mis Eventos');

    const groups = new Map<string, CalendarCompleteEventData[]>();
    events.forEach(event => {
      const cat = event.category ?? 'general';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(event);
    });

    groups.forEach((eventsInGroup, categoryKey) => {
      const categoryLabel = categories[categoryKey as CategoryKey] ?? categoryKey;
      const composite = new CalendarEventComposite(categoryLabel);
      eventsInGroup.forEach(e => composite.add(new CalendarEventLeaf(e)));
      root.add(composite);
    });

    return root;
  }
}