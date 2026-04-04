import { addHours } from 'date-fns';
import type { CalendarEventData } from '..';

export class EventBuilder {
    private event: Partial<CalendarEventData> = {
        title: '',
        notes: '',
        start: new Date(),
        end: addHours(new Date(), 2),
    };

    public setTitle(title: string): this {
        this.event.title = title;
        return this;
    }

    public setStart(start: Date | string): this {
        this.event.start = start;
        return this;
    }

    public setEnd(end: Date | string): this {
        this.event.end = end;
        return this;
    }

    public setNotes(notes: string): this {
        this.event.notes = notes;
        return this;
    }

    public setBgColor(bgColor?: string): this {
        this.event.bgColor = bgColor;
        return this;
    }

    public setUser(user?: CalendarEventData['user']): this {
        this.event.user = user;
        return this;
    }

    public setId(id?: string): this {
        this.event._id = id;
        return this;
    }

    public build(): CalendarEventData {
        return this.event as CalendarEventData;
    }
}