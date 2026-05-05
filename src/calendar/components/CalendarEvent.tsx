import { useMemo } from 'react';
import type { CalendarEventData } from '..';
import { useCalendarStore } from '../../hooks';

interface CalendarEventProps {
    event: CalendarEventData;
}

export const CalendarEvent = ({ event }: CalendarEventProps) => {
    const { title, user, padre } = event;
    const { events } = useCalendarStore();

    // Nombre del evento padre, si este evento es subevento
    const parentName = useMemo(() => {
        if (!padre) return null;
        return events.find((e: { id: string; }) => e.id === padre)?.title ?? null;
    }, [padre, events]);

    return (
        <>
            <strong>{title}</strong>
            <span> — {user?.name}</span>
            {parentName && (
                <span style={{ fontSize: '0.72em', opacity: 0.85, marginLeft: 4 }}>
                    📁 {parentName}
                </span>
            )}
        </>
    );
};