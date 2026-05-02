// src/calendar/pages/MyEventsPage.tsx

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { categories, type CalendarCompleteEventData, type CategoryKey } from '..';
import { CalendarEventCard, DarkThemeImplementor, LightThemeImplementor } from '../bridge';
import type { IThemeImplementor } from '../bridge';
import { useAuthStore, useCalendarStore } from '../../hooks';
import { Navbar } from '../components/Navbar';

export const MyEventsPage = () => {
    const { user } = useAuthStore();
    const { events } = useCalendarStore();
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
    const [titleFilter, setTitleFilter] = useState('');

    // BRIDGE — estado del implementor de tema
    const [theme, setTheme] = useState<IThemeImplementor>(new LightThemeImplementor());

    const toggleTheme = () => {
        setTheme(prev =>
            prev.getThemeName() === 'light'
                ? new DarkThemeImplementor()
                : new LightThemeImplementor()
        );
    };

    // Filtrar solo los eventos del usuario actual
    const myEvents = useMemo(() => {
        return events.filter((event: CalendarCompleteEventData) => event.user?._id === user?._id);
    }, [events, user?._id]);

    // Filtrar por categoría y título
    const filteredEvents = useMemo(() => {
        let result = myEvents;

        if (selectedCategory !== 'all') {
            result = result.filter((event: CalendarCompleteEventData) => event.category === selectedCategory);
        }

        if (titleFilter.trim()) {
            result = result.filter((event: CalendarCompleteEventData) =>
                event.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        }

        return result;
    }, [myEvents, selectedCategory, titleFilter]);

    const handleGoBack = () => navigate('/');

    const getCategoryLabel = (category: CategoryKey) => categories[category];

    return (
        <>
            <Navbar />
            <div className="container mt-4">

                {/* Header con botones — BRIDGE toggle aquí */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Mis Eventos</h1>
                    <div className="d-flex gap-2">

                        {/* Botón toggle de tema — BRIDGE */}
                        <button
                            className="btn btn-outline-secondary"
                            onClick={toggleTheme}
                            title={`Cambiar a tema ${theme.getThemeName() === 'light' ? 'oscuro' : 'claro'}`}
                        >
                            <i className={`fas fa-${theme.getThemeName() === 'light' ? 'moon' : 'sun'}`}></i>
                            &nbsp;
                            <span>
                                Tema {theme.getThemeName() === 'light' ? 'Oscuro' : 'Claro'}
                            </span>
                        </button>

                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleGoBack}
                        >
                            <i className="fas fa-arrow-left"></i>
                            &nbsp;
                            <span>Volver al Calendario</span>
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="mb-4">
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Buscar por título..."
                        value={titleFilter}
                        onChange={(e) => setTitleFilter(e.target.value)}
                    />
                </div>

                {/* Filtro por categoría */}
                <div className="mb-4">
                    <label htmlFor="categoryFilter" className="form-label fw-bold">
                        Filtrar por Categoría:
                    </label>
                    <select
                        id="categoryFilter"
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as CategoryKey | 'all')}
                    >
                        <option value="all">Todas ({myEvents.length})</option>
                        {(Object.keys(categories) as CategoryKey[]).map((key) => (
                            <option key={key} value={key}>
                                {getCategoryLabel(key)} ({myEvents.filter((e: CalendarCompleteEventData) => e.category === key).length})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lista de eventos — BRIDGE aplicado en CalendarEventCard */}
                <div className="row">
                    {filteredEvents.length === 0 ? (
                        <div className="col-12">
                            <div className="alert alert-info" role="alert">
                                <i className="fas fa-info-circle"></i>
                                &nbsp;
                                {selectedCategory === 'all'
                                    ? 'No tienes eventos aún.'
                                    : `No tienes eventos en la categoría ${getCategoryLabel(selectedCategory as CategoryKey)}.`}
                            </div>
                        </div>
                    ) : (
                        filteredEvents.map((event: CalendarCompleteEventData) => (
                            <div key={event._id} className="col-md-6 col-lg-4 mb-3">
                                {/*
                                 * BRIDGE en acción:
                                 * CalendarEventCard (abstracción) no sabe nada del tema.
                                 * Recibe el implementor concreto (light o dark) como prop
                                 * y delega 100% de los estilos a él.
                                 */}
                                <CalendarEventCard event={event} theme={theme} />
                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    );
};