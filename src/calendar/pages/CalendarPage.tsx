import { useEffect, useState, useMemo } from 'react';
import { Calendar, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
    CalendarEvent,
    CalendarModal,
    FabAddNew,
    FabDelete,
    Navbar,
    type CalendarCompleteEventData,
    type User,
} from '..';

import { localizer, getMessagesES } from '../../helpers';
import { useAuthStore, useCalendarStore, useUiStore } from '../../hooks';
import { FabCancelSelect } from '../components/FabCancelSelect';

export const CalendarPage = () => {
    const { user } = useAuthStore();
    const currentUser = user as User;
    const { events, setActiveEvent, startLoadingEvents } = useCalendarStore();
    const { openDateModal } = useUiStore();

    const [lastView, setLastView] = useState<View>(
        localStorage.getItem('lastView') as View ?? 'week'
    );

    // Set de IDs que tienen al menos un hijo → son eventos padre
    const parentIds = useMemo(() => {
        const ids = new Set<string>();
        for (const ev of events) {
            if (ev.padre) ids.add(ev.padre);
        }
        return ids;
    }, [events]);

    // El calendario muestra SOLO:
    //  ✅ Subeventos (ev.padre existe)
    //  ✅ Eventos independientes (sin padre, con fechas, sin hijos)
    //  ❌ Eventos padre → excluidos del calendario
    const calendarEvents = useMemo(() => {
        return events.filter((ev: CalendarCompleteEventData) => {
            if (parentIds.has(ev.id!)) return false;  // es padre de alguien → fuera
            if (!ev.start || !ev.end) return false;    // sin fechas → fuera
            return true;
        });
    }, [events, parentIds]);

    const eventStyleGetter = (event: CalendarCompleteEventData) => {
        const isMyEvent = currentUser?.id === event.user?.id;
        const color = event.bgColor || '#347CF7';
        return {
            style: {
                backgroundColor: isMyEvent ? color : '#465660',
                borderRadius: '0px',
                opacity: 0.8,
                color: 'white',
            },
        };
    };

    const onDoubleClick = () => openDateModal();

    const onSelect = (event: CalendarCompleteEventData) => setActiveEvent(event);

    const onViewChanged = (event: View) => {
        localStorage.setItem('lastView', event);
        setLastView(event);
    };

    useEffect(() => {
        startLoadingEvents();
    }, [startLoadingEvents]);

    return (
        <>
            <Navbar />
            <Calendar
                culture="es"
                localizer={localizer}
                events={calendarEvents}
                defaultView={lastView}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 80px)' }}
                messages={getMessagesES()}
                eventPropGetter={eventStyleGetter}
                components={{ event: CalendarEvent }}
                onDoubleClickEvent={onDoubleClick}
                onSelectEvent={onSelect}
                onView={onViewChanged}
            />
            <CalendarModal />
            <FabAddNew />
            <FabDelete />
            <FabCancelSelect />
        </>
    );
};