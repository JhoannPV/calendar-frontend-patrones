import type { CalendarEventData } from '..';

// Tipo interno que permite undefined en todas las propiedades excepto start/end que permiten null
type EventDraft = Omit<Partial<CalendarEventData>, 'start' | 'end'> & {
    start: Date | string | null;
    end:   Date | string | null;
};

export class EventBuilder {
    private event: EventDraft = {
        title: '',
        notes: '',
        start: null,
        end:   null,
    };

    public setTitle(title: string): this {
        this.event.title = title;
        return this;
    }

    public setStart(start: Date | string | null): this {
        this.event.start = start;
        return this;
    }

    public setEnd(end: Date | string | null): this {
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
        this.event.id = id;
        return this;
    }

    public setPadre(padre?: string | null): this {
        this.event.padre = padre ?? undefined;
        return this;
    }

    public build(): CalendarEventData {
        return this.event as CalendarEventData;
    }
}