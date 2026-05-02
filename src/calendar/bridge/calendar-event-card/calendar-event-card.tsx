// src/calendar/bridge/calendar-event-card/calendar-event-card.tsx

import type { CalendarCompleteEventData } from '../../types/CalendarTypes';
import type { IThemeImplementor } from '../theme-implementor/theme.implementor.interface';
import { categories, type CategoryKey } from '../../types/CalendarTypes';

interface CalendarEventCardProps {
  event: CalendarCompleteEventData;
  theme: IThemeImplementor;
}

export const CalendarEventCard = ({ event, theme }: CalendarEventCardProps) => {
  const styles = theme.getStyles();
  const categoryLabel = categories[event.category as CategoryKey] ?? event.category;
  const headerColor = event.bgColor || '#347CF7';

  return (
    <div
      style={{
        background: styles.cardBackground,
        border: styles.cardBorder,
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '8px',
      }}
    >
      {/* Encabezado — color del Decorator */}
      <div style={{ backgroundColor: headerColor, padding: '10px 16px' }}>
        <strong style={{ color: '#ffffff', fontSize: '1rem' }}>
          {event.title}
        </strong>
      </div>

      {/* Cuerpo — cambia con el tema */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>

        <span style={{ color: styles.subtitleColor, fontSize: '0.85rem' }}>
          👤 {event.user?.name}
        </span>

        {/* Fechas */}
        <span style={{ color: styles.titleColor, fontSize: '0.82rem' }}>
          🕐 <strong>Inicio:</strong> {new Date(event.start).toLocaleString('es-ES')}
        </span>
        <span style={{ color: styles.titleColor, fontSize: '0.82rem' }}>
          🕓 <strong>Fin:</strong> {new Date(event.end).toLocaleString('es-ES')}
        </span>

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
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              background: styles.badgeBackground,
              color: styles.badgeColor,
            }}
          >
            {categoryLabel}
          </span>
        </div>

      </div>
    </div>
  );
};