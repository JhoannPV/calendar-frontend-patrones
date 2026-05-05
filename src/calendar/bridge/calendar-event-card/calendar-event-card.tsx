// src/calendar/bridge/calendar-event-card/calendar-event-card.tsx

import type { CalendarCompleteEventData } from '../../types/CalendarTypes';
import type { IThemeImplementor } from '../theme-implementor/theme.implementor.interface';
import { categories, type CategoryKey } from '../../types/CalendarTypes';

interface CalendarEventCardProps {
    event:       CalendarCompleteEventData;
    theme:       IThemeImplementor;
    /** Nombre del evento padre, si este es un sub-evento */
    parentName?: string;
}

export const CalendarEventCard = ({ event, theme, parentName }: CalendarEventCardProps) => {
    const styles        = theme.getStyles();
    const categoryLabel = categories[event.category as CategoryKey] ?? event.category;
    const headerColor   = event.bgColor || '#347CF7';
    // Es evento padre si no tiene fechas asignadas
    const isParent      = !event.start && !event.end;

    return (
        <div
            style={{
                background:   styles.cardBackground,
                border:       styles.cardBorder,
                borderRadius: '8px',
                overflow:     'hidden',
                marginBottom: '8px',
            }}
        >
            {/* Encabezado coloreado por el Decorator */}
            <div style={{ backgroundColor: headerColor, padding: '10px 16px' }}>
                <strong style={{ color: '#ffffff', fontSize: '1rem' }}>
                    {isParent && <span title="Evento mayor">📁 </span>}
                    {event.title}
                </strong>
            </div>

            {/* Cuerpo */}
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>

                <span style={{ color: styles.subtitleColor, fontSize: '0.85rem' }}>
                    👤 {event.user?.name}
                </span>

                {/* Fechas — solo si existen (subeventos e independientes) */}
                {event.start && (
                    <span style={{ color: styles.titleColor, fontSize: '0.82rem' }}>
                        🕐 <strong>Inicio:</strong> {new Date(event.start).toLocaleString('es-ES')}
                    </span>
                )}
                {event.end && (
                    <span style={{ color: styles.titleColor, fontSize: '0.82rem' }}>
                        🕓 <strong>Fin:</strong> {new Date(event.end).toLocaleString('es-ES')}
                    </span>
                )}

                {/* Evento padre al que pertenece */}
                {parentName && (
                    <span style={{ color: styles.subtitleColor, fontSize: '0.82rem', fontStyle: 'italic' }}>
                        📁 Parte de: <strong>{parentName}</strong>
                    </span>
                )}

                {/* Notas */}
                {event.notes && (
                    <span style={{ color: styles.subtitleColor, fontSize: '0.82rem' }}>
                        📝 {event.notes}
                    </span>
                )}

                {/* Badge categoría */}
                <div>
                    <span
                        style={{
                            display:      'inline-block',
                            padding:      '2px 10px',
                            borderRadius: '12px',
                            fontSize:     '0.75rem',
                            background:   styles.badgeBackground,
                            color:        styles.badgeColor,
                        }}
                    >
                        {categoryLabel}
                    </span>
                </div>

            </div>
        </div>
    );
};