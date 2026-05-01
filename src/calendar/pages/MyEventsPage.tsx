import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { categories, type CalendarCompleteEventData, type CategoryKey } from '..'
import { useAuthStore, useCalendarStore } from '../../hooks';
import { Navbar } from '../components/Navbar';

export const MyEventsPage = () => {
    const { user } = useAuthStore();
    const { events } = useCalendarStore();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
    const [titleFilter, setTitleFilter] = useState('');

    // Filtrar solo los eventos del usuario actual
    const myEvents = useMemo(() => {
        return events.filter((event: CalendarCompleteEventData) => event.user?._id === user?._id);
    }, [events, user?._id]);

    // Filtrar por categoría y título
    const filteredEvents = useMemo(() => {
        let result = myEvents;

        // Filtrar por categoría
        if (selectedCategory !== 'all') {
            result = result.filter((event: CalendarCompleteEventData) => event.category === selectedCategory);
        }

        // Filtrar por título
        if (titleFilter.trim()) {
            result = result.filter((event: CalendarCompleteEventData) =>
                event.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        }

        return result;
    }, [myEvents, selectedCategory, titleFilter]);

    const handleGoBack = () => {
        navigate('/');
    };

    const getCategoryLabel = (category: CategoryKey) => {
        return categories[category];
    };

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Mis Eventos</h1>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={handleGoBack}
                    >
                        <i className="fas fa-arrow-left"></i>
                        &nbsp;
                        <span>Volver al Calendario</span>
                    </button>
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
                    <label htmlFor="categoryFilter" className="form-label fw-bold">Filtrar por Categoría:</label>
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

                {/* Lista de eventos */}
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
                                <div className="card h-100">
                                    <div
                                        className="card-header"
                                        style={{
                                            backgroundColor: event.bgColor || '#347CF7',
                                            color: 'white',
                                        }}
                                    >
                                        <h5 className="card-title mb-0">{event.title}</h5>
                                    </div>
                                    <div className="card-body">
                                        <p className="card-text">
                                            <strong>Notas:</strong> {event.notes || 'Sin notas'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Categoría:</strong>{' '}
                                            <span className="badge bg-secondary">
                                                {getCategoryLabel(event.category as CategoryKey)}
                                            </span>
                                        </p>
                                        <p className="card-text text-muted">
                                            <strong>Inicio:</strong>{' '}
                                            {new Date(event.start).toLocaleString('es-ES')}
                                        </p>
                                        <p className="card-text text-muted">
                                            <strong>Fin:</strong>{' '}
                                            {new Date(event.end).toLocaleString('es-ES')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};
