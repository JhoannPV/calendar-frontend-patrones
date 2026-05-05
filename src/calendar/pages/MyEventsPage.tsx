// src/calendar/pages/MyEventsPage.tsx

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { categories, type CalendarCompleteEventData, type CategoryKey } from '..';
import { CalendarEventCard, DarkThemeImplementor, LightThemeImplementor } from '../bridge';
import type { IThemeImplementor } from '../bridge';
import { useAuthStore, useCalendarStore } from '../../hooks';
import { Navbar } from '../components/Navbar';

import { CompositeNode } from '../composite/composite-node';
import { LeafNode } from '../composite/leaf-node';
import type { ICalendarNode } from '../composite/calendar-node.interface';

interface AuthUser {
    _id: string;
    name: string;
}

const getUserId = (user: { _id?: string; id?: string } | null | undefined) => user?._id ?? user?.id ?? null;


export const MyEventsPage = () => {
    const { user }                                              = useAuthStore();
    const { events, startLoadingEvents, startDeletingEventById } = useCalendarStore();
    const navigate                                              = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
    const [titleFilter, setTitleFilter]           = useState('');
    const [theme, setTheme] = useState<IThemeImplementor>(new LightThemeImplementor());

    useEffect(() => {
        if (events.length === 0) {
            startLoadingEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTheme = () =>
        setTheme(prev =>
            prev.getThemeName() === 'light'
                ? new DarkThemeImplementor()
                : new LightThemeImplementor()
        );

    const myEvents = useMemo(() => {
        const authUser = user as AuthUser | { id?: string } | null;
        const authUserId = getUserId(authUser);
        if (!authUserId) return [];

        return events.filter((event: CalendarCompleteEventData) =>
            getUserId(event.user) === authUserId
        );
    }, [events, user]);

    const filteredEvents = useMemo(() => {
        let result = myEvents;
        if (selectedCategory !== 'all')
            result = result.filter((e: { category: string; }) => e.category === selectedCategory);
        if (titleFilter.trim())
            result = result.filter((e: { title: string; }) =>
                e.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        return result;
    }, [myEvents, selectedCategory, titleFilter]);

    // ✅ AQUÍ — después del useMemo, no dentro ni antes
    console.log('filteredEvents con padre:', filteredEvents.map((e: CalendarCompleteEventData) => ({
        id: e.id, title: e.title, padre: e.padre
    })));

    const eventTree = useMemo<ICalendarNode[]>(() => {
        const map = new Map<string, ICalendarNode>();
        for (const ev of filteredEvents) {
            if (!ev.padre) map.set(ev.id!, new CompositeNode(ev));
            else           map.set(ev.id!, new LeafNode(ev));
        }
        for (const ev of filteredEvents) {
            if (ev.padre) {
                const parent = map.get(ev.padre);
                const child = map.get(ev.id!);
                if (parent instanceof CompositeNode && child) {
                    parent.add(child);
                }
            }
        }
        return [...map.values()].filter(n => !n.getData().padre);
    }, [filteredEvents]);

    const getUrgencyLabel = (bgColor?: string) => {
        switch (bgColor) {
            case '#FF0000': return { label: '🔴 Urgente', badge: 'danger' };
            case '#FFA500': return { label: '🟡 Medio', badge: 'warning' };
            case '#00CC00': return { label: '🟢 Tranquilo', badge: 'success' };
            default: return { label: '⚫ Pasado', badge: 'dark' };
        }
    };

    // Botón de eliminar reutilizable
    const DeleteBtn = ({ id }: { id: string }) => (
        <button
            className="btn btn-sm btn-outline-danger"
            title="Eliminar evento"
            onClick={() => startDeletingEventById(id)}
        >
            <i className="fas fa-trash-alt"></i>
        </button>
    );

    return (
        <>
            <Navbar />
            <div className="container mt-4">

                {/* CABECERA */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Mis Eventos</h1>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary" onClick={toggleTheme}>
                            <i className={`fas fa-${theme.getThemeName() === 'light' ? 'moon' : 'sun'}`}></i>
                            &nbsp;Tema {theme.getThemeName() === 'light' ? 'Oscuro' : 'Claro'}
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
                            <i className="fas fa-arrow-left"></i>&nbsp;Volver
                        </button>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por título..."
                        value={titleFilter}
                        onChange={e => setTitleFilter(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label fw-bold">Filtrar por Categoría</label>
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value as CategoryKey | 'all')}
                    >
                        <option value="all">Todas ({myEvents.length})</option>
                        {(Object.keys(categories) as CategoryKey[]).map(key => (
                            <option key={key} value={key}>{categories[key]}</option>
                        ))}
                    </select>
                </div>

                {/* LEYENDA DECORATOR */}
                <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
                    <small className="text-muted fw-bold me-1">Color Decorator:</small>
                    <span className="badge bg-danger">Urgente &lt;24h</span>
                    <span className="badge bg-warning text-dark">Medio 1–7 días</span>
                    <span className="badge bg-success">Tranquilo +7 días</span>
                    <span className="badge bg-dark">Pasado</span>
                    <span className="badge bg-secondary">Evento mayor</span>
                </div>

                {/* LISTADO COMPOSITE */}
                <div className="row">
                    {eventTree.length === 0 ? (
                        <div className="col-12">
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                {selectedCategory === 'all'
                                    ? 'No tienes eventos aún.'
                                    : 'No tienes eventos en la categoría seleccionada.'}
                            </div>
                        </div>
                    ) : (
                        eventTree.map(node => {
                            const urgency = getUrgencyLabel(node.getData().bgColor);

                            // ── CASO 1: Evento padre CON sub-eventos ──────────────────────
                            if (node.isComposite() && node.getChildren().length > 0) {
                                return (
                                    <div key={node.getData().id} className="col-12 mb-4">
                                        <div className="alert alert-secondary fw-bold mb-2 d-flex justify-content-between align-items-center">
                                            <span>
                                                <i className="fas fa-layer-group me-2"></i>
                                                {node.getData().title}
                                                <span className="ms-2 text-muted fw-normal" style={{ fontSize: '0.85rem' }}>
                                                    ({node.getChildren().length} sub-evento
                                                    {node.getChildren().length !== 1 ? 's' : ''})
                                                </span>
                                            </span>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className={`badge bg-${urgency.badge}`}>{urgency.label}</span>
                                                <DeleteBtn id={node.getData().id!} />
                                            </div>
                                        </div>

                                        {node.getChildren().map(child => {
                                            const childUrgency = getUrgencyLabel(child.getData().bgColor);
                                            return (
                                                <div
                                                    key={child.getData().id}
                                                    className="ms-4 border-start border-secondary ps-3 mt-2"
                                                >
                                                    <div className="mb-1 d-flex align-items-center gap-2">
                                                        <span className={`badge bg-${childUrgency.badge}`}>
                                                            {childUrgency.label}
                                                        </span>
                                                        <DeleteBtn id={child.getData().id!} />
                                                    </div>
                                                    <CalendarEventCard
                                                        event={child.getData()}
                                                        theme={theme}
                                                        parentName={node.getData().title}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }

                            // ── CASO 2: Evento mayor SIN sub-eventos aún ─────────────────
                            const isEmptyParent =
                                !node.getData().padre &&
                                !node.getData().start &&
                                !node.getData().end;

                            if (isEmptyParent) {
                                return (
                                    <div key={node.getData().id} className="col-12 mb-3">
                                        <div className="alert alert-secondary fw-bold d-flex justify-content-between align-items-center">
                                            <span>
                                                <i className="fas fa-layer-group me-2"></i>
                                                {node.getData().title}
                                                <span className="ms-2 text-muted fw-normal" style={{ fontSize: '0.85rem' }}>
                                                    (sin sub-eventos aún)
                                                </span>
                                            </span>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-secondary">Evento mayor</span>
                                                <DeleteBtn id={node.getData().id!} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // ── CASO 3: Evento independiente ─────────────────────────────
                            const parentName = node.getData().padre
                                ? eventNameMap.get(node.getData().padre!) ?? undefined
                                : undefined;

                            return (
                                <div key={node.getData().id} className="col-md-6 col-lg-4 mb-3">
                                    <div className="mb-1 d-flex align-items-center gap-2">
                                        <span className={`badge bg-${urgency.badge}`}>{urgency.label}</span>
                                        <DeleteBtn id={node.getData().id!} />
                                    </div>
                                    <CalendarEventCard
                                        event={node.getData()}
                                        theme={theme}
                                        parentName={parentName}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </>
    );
};