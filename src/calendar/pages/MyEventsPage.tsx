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
    id: string;
    name: string;
}


export const MyEventsPage = () => {
    const { user } = useAuthStore();
    const { events, startLoadingEvents } = useCalendarStore();
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
    const [titleFilter, setTitleFilter] = useState('');


    // BRIDGE
    const [theme, setTheme] = useState<IThemeImplementor>(new LightThemeImplementor());

    // FIX: array vacío — no depende de startLoadingEvents
    // Solo recarga si no hay eventos en el store al llegar directo a /my-events
    useEffect(() => {
        if (events.length === 0) {
            startLoadingEvents();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTheme = () => {
        setTheme(prev =>
            prev.getThemeName() === 'light'
                ? new DarkThemeImplementor()
                : new LightThemeImplementor()
        );
    };

    // FIX: cast correcto del usuario autenticado
    const myEvents = useMemo(() => {
        const authUser = user as AuthUser | null;
        if (!authUser?.id) return [];

        return events.filter((event: CalendarCompleteEventData) =>
            event.user?.id === authUser.id
        );
    }, [events, user]);

    // Filtros
    // Filtros
    const filteredEvents = useMemo(() => {
        let result = myEvents;
        if (selectedCategory !== 'all') {
            result = result.filter((event: CalendarCompleteEventData) =>
                event.category === selectedCategory
            );
        }
        if (titleFilter.trim()) {
            result = result.filter((event: CalendarCompleteEventData) =>
                event.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        }
        return result;
    }, [myEvents, selectedCategory, titleFilter]);

    // ✅ AQUÍ — después del useMemo, no dentro ni antes
    console.log('filteredEvents con padre:', filteredEvents.map((e: { id: any; title: any; padre: any; }) => ({
        id: e.id, title: e.title, padre: e.padre
    })));

    // COMPOSITE — construir árbol de eventos
    const eventTree = useMemo<ICalendarNode[]>(() => {
        const map = new Map<string, ICalendarNode>();

        for (const ev of filteredEvents) {
            if (!ev.padre) {
                map.set(ev.id!, new CompositeNode(ev));
            } else {
                map.set(ev.id!, new LeafNode(ev));
            }
        }

        for (const ev of filteredEvents) {
            if (ev.padre) {
                const parent = map.get(ev.padre);
                const child  = map.get(ev.id!);
                if (parent instanceof CompositeNode && child) {
                    parent.add(child);
                }
            }
        }

        return [...map.values()].filter(n => !n.getData().padre);
    }, [filteredEvents]);

    // FIX colores: etiqueta de urgencia basada en bgColor del Decorator
    const getUrgencyLabel = (bgColor?: string) => {
        switch (bgColor) {
            case '#FF0000': return { label: '🔴 Urgente',  badge: 'danger'  };
            case '#FFA500': return { label: '🟡 Medio',    badge: 'warning' };
            case '#00CC00': return { label: '🟢 Tranquilo',badge: 'success' };
            default:        return { label: '⚫ Pasado',   badge: 'dark'    };
        }
    };

    const handleGoBack = () => navigate('/');
    const getCategoryLabel = (category: CategoryKey) => categories[category];

    return (
        <>
            <Navbar />
            <div className="container mt-4">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Mis Eventos</h1>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary" onClick={toggleTheme}>
                            <i className={`fas fa-${theme.getThemeName() === 'light' ? 'moon' : 'sun'}`} />
                            &nbsp;Tema {theme.getThemeName() === 'light' ? 'Oscuro' : 'Claro'}
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handleGoBack}>
                            <i className="fas fa-arrow-left" />
                            &nbsp;Volver
                        </button>
                    </div>
                </div>

                {/* FILTRO POR TÍTULO */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por título..."
                        value={titleFilter}
                        onChange={(e) => setTitleFilter(e.target.value)}
                    />
                </div>

                {/* FILTRO POR CATEGORÍA */}
                <div className="mb-4">
                    <label className="form-label fw-bold">Filtrar por Categoría:</label>
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as CategoryKey | 'all')}
                    >
                        <option value="all">Todas ({myEvents.length})</option>
                        {(Object.keys(categories) as CategoryKey[]).map((key) => (
                            <option key={key} value={key}>{getCategoryLabel(key)}</option>
                        ))}
                    </select>
                </div>

                {/* LEYENDA DE COLORES — Decorator */}
                <div className="d-flex gap-2 mb-4 flex-wrap">
                    <small className="text-muted fw-bold me-1">Color Decorator:</small>
                    <span className="badge bg-danger">🔴 Urgente — menos de 24h</span>
                    <span className="badge bg-warning text-dark">🟡 Medio — 1 a 7 días</span>
                    <span className="badge bg-success">🟢 Tranquilo — más de 7 días</span>
                    <span className="badge bg-dark">⚫ Pasado</span>
                </div>

                {/* RENDER COMPOSITE */}
                <div className="row">
                    {eventTree.length === 0 ? (
                        <div className="col-12">
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2" />
                                {selectedCategory === 'all'
                                    ? 'No tienes eventos aún.'
                                    : `No tienes eventos en la categoría ${getCategoryLabel(selectedCategory as CategoryKey)}.`}
                            </div>
                        </div>
                    ) : (
                        eventTree.map(node => {
                            const urgency = getUrgencyLabel(node.getData().bgColor);

                            // CASO 1: Grupo con hijos — COMPOSITE
                            if (node.isComposite() && node.getChildren().length > 0) {
                                return (
                                    <div key={node.getData().id} className="col-12 mb-4">
                                        <div className="alert alert-secondary fw-bold mb-2 d-flex justify-content-between align-items-center">
                                            <span>
                                                <i className="fas fa-layer-group me-2" />
                                                {node.getData().title} ({node.getChildren().length} sub-evento{node.getChildren().length !== 1 ? 's' : ''})
                                            </span>
                                            {/* FIX colores: badge urgencia del padre */}
                                            <span className={`badge bg-${urgency.badge}`}>
                                                {urgency.label}
                                            </span>
                                        </div>

                                        <CalendarEventCard event={node.getData()} theme={theme} />

                                        {node.getChildren().map(child => {
                                            const childUrgency = getUrgencyLabel(child.getData().bgColor);
                                            return (
                                                <div
                                                    key={child.getData().id}
                                                    className="ms-4 border-start border-secondary ps-3 mt-2"
                                                >
                                                    {/* FIX colores: badge urgencia de cada hijo */}
                                                    <div className="mb-1">
                                                        <span className={`badge bg-${childUrgency.badge}`}>
                                                            {childUrgency.label}
                                                        </span>
                                                    </div>
                                                    <CalendarEventCard event={child.getData()} theme={theme} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }

                            // CASO 2: Evento simple sin hijos
                            return (
                                <div key={node.getData().id} className="col-md-6 col-lg-4 mb-3">
                                    {/* FIX colores: badge urgencia */}
                                    <div className="mb-1">
                                        <span className={`badge bg-${urgency.badge}`}>
                                            {urgency.label}
                                        </span>
                                    </div>
                                    <CalendarEventCard event={node.getData()} theme={theme} />
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </>
    );
};

