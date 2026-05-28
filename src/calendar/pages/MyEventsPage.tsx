import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { CalendarEventCard, CalendarEventCardComponent, CalendarModal, categories, DarkThemeImplementor, LightThemeImplementor, type CalendarCompleteEventData, type CategoryKey, type IThemeImplementor, type User } from '..';
import { useAuthStore, useCalendarStore, useUiStore } from '../../hooks';
import { Navbar } from '../components/Navbar';
import { CompositeNode } from '../composite/composite-node';
import { LeafNode } from '../composite/leaf-node';
import type { ICalendarNode } from '../composite/calendar-node.interface';


export const MyEventsPage = () => {
    const { user } = useAuthStore();
    const { events, setActiveEvent, startLoadingEvents, startDeletingEventById } = useCalendarStore();
    const { theme: themeName, toggleTheme, openDateModal } = useUiStore();
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
    const [titleFilter, setTitleFilter] = useState('');
    const [parentFilters, setParentFilters] = useState<Record<string, { title: string; category: CategoryKey | 'all' }>>({});

    const theme: IThemeImplementor = useMemo(
        () => themeName === 'dark' ? new DarkThemeImplementor() : new LightThemeImplementor(),
        [themeName]
    );

    // Siempre recargar al entrar a la página
    useEffect(() => {
        startLoadingEvents();
    }, [startLoadingEvents]);

    const updateParentFilter = (parentId: string, field: 'title' | 'category', value: string) => {
        setParentFilters(prev => ({
            ...prev,
            [parentId]: {
                title: prev[parentId]?.title ?? '',
                category: prev[parentId]?.category ?? 'all',
                [field]: field === 'category' ? (value as CategoryKey | 'all') : value,
            },
        }));
    };

    // Todos los eventos del usuario actual
    const myEvents = useMemo(() => {
        const authUser = user as User | null;
        if (!authUser?.id) return [];
        return events.filter((e: CalendarCompleteEventData) => e.user?.id === authUser.id);
    }, [events, user]);

    // Mapa id → nombre para mostrar el padre en eventos independientes
    const eventNameMap = useMemo(() => {
        const map = new Map<string, string>();
        events.forEach((e: { id: string; title: string; }) => { if (e.id) map.set(e.id, e.title); });
        return map;
    }, [events]);

    // ✅ ÁRBOL construido con TODOS los myEvents, sin filtrar aún
    const eventTree = useMemo<ICalendarNode[]>(() => {
        const map = new Map<string, ICalendarNode>();

        // 1. Crear nodos para TODOS los eventos del usuario
        for (const ev of myEvents) {
            const isParent = !ev.padre; // padre = null/undefined → es raíz
            if (isParent) map.set(ev.id!, new CompositeNode(ev));
            else map.set(ev.id!, new LeafNode(ev));
        }

        // 2. Vincular hijos a sus padres
        for (const ev of myEvents) {
            if (ev.padre) {
                const parentNode = map.get(ev.padre);
                const childNode = map.get(ev.id!);
                if (parentNode instanceof CompositeNode && childNode) {
                    parentNode.add(childNode);
                }
            }
        }

        // 3. Solo raíces (eventos sin padre)
        const roots = [...map.values()].filter(n => !n.getData().padre);

        // 4. Aplicar filtros de UI sobre las raíces ya construidas
        return roots.filter(node => {
            const data = node.getData();

            const matchCat = selectedCategory === 'all' || data.category === selectedCategory;

            if (!titleFilter.trim()) return matchCat;

            const lc = titleFilter.toLowerCase();
            const matchTitle =
                data.title.toLowerCase().includes(lc) ||
                node.getChildren().some(c =>
                    c.getData().title.toLowerCase().includes(lc)
                );

            return matchCat && matchTitle;
        });
    }, [myEvents, selectedCategory, titleFilter]);

    const getUrgencyLabel = (bgColor?: string, isParent = false) => {
        if (isParent) return { label: 'Evento mayor', badge: 'secondary' };
        switch (bgColor) {
            case '#FF0000': return { label: 'Urgente', badge: 'danger' };
            case '#FFA500': return { label: 'Medio', badge: 'warning' };
            case '#00CC00': return { label: 'Tranquilo', badge: 'success' };
            case '#6c757d': return { label: 'Mayor', badge: 'secondary' };
            default: return { label: 'Pasado', badge: 'dark' };
        }
    };

    const DeleteBtn = ({ id }: { id: string }) => (
        <button
            className="btn btn-sm btn-outline-danger"
            title="Eliminar evento"
            onClick={() => startDeletingEventById(id)}
        >
            <i className="fas fa-trash-alt"></i>
        </button>
    );

    const EditBtn = ({ event }: { event: CalendarCompleteEventData }) => (
        <button
            className="btn btn-sm btn-outline-primary"
            title="Editar evento"
            onClick={() => {
                setActiveEvent(event);
                openDateModal();
            }}
        >
            <i className="fas fa-pen"></i>
        </button>
    );

    return (
        <>
            <Navbar />
            <CalendarModal />
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
                    <span className="badge bg-warning text-dark">Medio 1-7 días</span>
                    <span className="badge bg-success">Tranquilo &gt;7 días</span>
                    <span className="badge bg-dark">Pasado</span>
                    <span className="badge bg-secondary">Evento mayor</span>
                </div>

                {/* LISTADO COMPOSITE */}
                <div className="row">
                    {eventTree.length === 0 ? (
                        <div className="col-12">
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                {myEvents.length === 0
                                    ? 'No tienes eventos aún.'
                                    : 'No hay eventos que coincidan con los filtros.'}
                            </div>
                        </div>
                    ) : eventTree.map(node => {
                        const isParentNode = !node.getData().start && !node.getData().end;
                        const urgency = getUrgencyLabel(node.getData().bgColor, isParentNode);
                        const nodeId = node.getData().id!;

                        const parentFilter = parentFilters[nodeId] ?? { title: '', category: 'all' as const };

                        // CASO 1: Evento padre CON sub-eventos
                        if (node.isComposite() && node.getChildren().length > 0) {
                            const filteredChildren = node.getChildren().filter(child => {
                                const childData = child.getData();
                                const matchCategory = parentFilter.category === 'all' || childData.category === parentFilter.category;
                                const matchTitle = !parentFilter.title.trim() || childData.title.toLowerCase().includes(parentFilter.title.toLowerCase().trim());
                                return matchCategory && matchTitle;
                            });

                            return (
                                <div key={nodeId} className="col-12 mb-4">
                                    <div className="alert alert-secondary fw-bold mb-2 d-flex justify-content-between align-items-center">
                                        <span>
                                            <i className="fas fa-layer-group me-2"></i>
                                            {node.getData().title}
                                            <span className="ms-2 text-muted fw-normal" style={{ fontSize: '0.85rem' }}>
                                                {filteredChildren.length} sub-evento{filteredChildren.length !== 1 ? 's' : ''}
                                            </span>
                                        </span>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge bg-${urgency.badge}`}>{urgency.label}</span>
                                            <EditBtn event={node.getData()} />
                                            <DeleteBtn id={nodeId} />
                                        </div>
                                    </div>
                                    <div className="ms-4 mb-3 rounded-3 border border-light-subtle bg-body-tertiary p-2">
                                        <div className="row g-2 align-items-center">
                                            <div className="col-12 col-md-7">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Buscar subevento por nombre..."
                                                    value={parentFilter.title}
                                                    onChange={e => updateParentFilter(nodeId, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-12 col-md-5">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={parentFilter.category}
                                                    onChange={e => updateParentFilter(nodeId, 'category', e.target.value)}
                                                >
                                                    <option value="all">Todas las categorías</option>
                                                    {(Object.keys(categories) as CategoryKey[]).map(key => (
                                                        <option key={key} value={key}>{categories[key]}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    {filteredChildren.length === 0 ? (
                                        <div className="ms-4 border-start border-secondary ps-3 mt-2 text-muted small">
                                            No hay subeventos que coincidan con ese filtro.
                                        </div>
                                    ) : filteredChildren.map(child => {
                                        const cu = getUrgencyLabel(child.getData().bgColor, false);
                                        return (
                                            <div key={child.getData().id} className="ms-4 border-start border-secondary ps-3 mt-2">
                                                <div className="mb-1 d-flex align-items-center gap-2">
                                                    <span className={`badge bg-${cu.badge}`}>{cu.label}</span>
                                                    <EditBtn event={child.getData()} />
                                                    <DeleteBtn id={child.getData().id!} />
                                                </div>
                                                <CalendarEventCard
                                                    card={
                                                        new CalendarEventCardComponent(
                                                            theme,
                                                            child.getData(),
                                                            node.getData().title // nombre del padre
                                                        )
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }

                        // CASO 2: Evento mayor SIN sub-eventos aún
                        if (isParentNode) {
                            return (
                                <div key={nodeId} className="col-12 mb-3">
                                    <div className="alert alert-secondary fw-bold d-flex justify-content-between align-items-center">
                                        <span>
                                            <i className="fas fa-layer-group me-2"></i>
                                            {node.getData().title}
                                            <span className="ms-2 text-muted fw-normal" style={{ fontSize: '0.85rem' }}>
                                                sin sub-eventos aún
                                            </span>
                                        </span>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-secondary">Evento mayor</span>
                                            <EditBtn event={node.getData()} />
                                            <DeleteBtn id={node.getData().id!} />
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // CASO 3: Evento independiente (con fechas, sin padre)
                        const parentName = node.getData().padre
                            ? eventNameMap.get(node.getData().padre!) ?? undefined
                            : undefined;

                        return (
                            <div key={node.getData().id} className="col-md-6 col-lg-4 mb-3">
                                <div className="mb-1 d-flex align-items-center gap-2">
                                    <span className={`badge bg-${urgency.badge}`}>{urgency.label}</span>
                                    <EditBtn event={node.getData()} />
                                    <DeleteBtn id={node.getData().id!} />
                                </div>
                                <CalendarEventCard
                                    card={
                                        new CalendarEventCardComponent(
                                            theme,
                                            node.getData(),
                                            parentName
                                        )
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};