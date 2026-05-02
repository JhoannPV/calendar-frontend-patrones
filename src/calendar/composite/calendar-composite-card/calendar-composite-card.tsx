// src/calendar/composite/calendar-composite-card/calendar-composite-card.tsx

import { useState } from 'react';
import type { ICalendarComponent } from '../calendar-component.interface';
import { CalendarEventComposite } from '../calendar-event-composite';
import { CalendarEventLeaf } from '../calendar-event-leaf';
import type { IThemeImplementor } from '../../bridge';

interface Props {
  component: ICalendarComponent;
  theme: IThemeImplementor;
  depth?: number;
}

export const CalendarCompositeCard = ({ component, theme, depth = 0 }: Props) => {
  const styles = theme.getStyles();
  const indent = depth * 16;
  const [isOpen, setIsOpen] = useState(true);

  // --- Hoja (evento individual) ---
  if (!component.isComposite()) {
    const leaf = component as CalendarEventLeaf;
    const headerColor = leaf.event.bgColor || '#347CF7';

    return (
      <div
        style={{
          marginLeft: `${indent}px`,
          marginBottom: '6px',
          background: styles.cardBackground,
          border: styles.cardBorder,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div style={{ backgroundColor: headerColor, padding: '8px 14px' }}>
          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
            {leaf.getTitle()}
          </strong>
        </div>
        <div style={{
          padding: '8px 14px',
          color: styles.subtitleColor,
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <span>👤 {leaf.event.user?.name}</span>
          <span>🕐 {new Date(leaf.event.start).toLocaleString('es-ES')}</span>
          <span>⏱ {leaf.getDurationMinutes()} min</span>
        </div>
      </div>
    );
  }

  // --- Compuesto (grupo de eventos) ---
  const composite = component as CalendarEventComposite;
  const isRoot = depth === 0;

  return (
    <div
      style={{
        marginLeft: `${indent}px`,
        marginBottom: '12px',
        border: isRoot ? 'none' : styles.cardBorder,
        borderRadius: '8px',
        overflow: 'hidden',
        background: styles.cardBackground,
      }}
    >
      {/* Encabezado del grupo — clickeable para desplegar/encoger */}
      {!isRoot && (
        <div
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            backgroundColor: styles.badgeBackground,
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <strong style={{ color: styles.badgeColor, fontSize: '0.95rem' }}>
            {/* Ícono de flecha que rota según estado */}
            <span
              style={{
                display: 'inline-block',
                marginRight: '8px',
                transition: 'transform 0.2s ease',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              ▶
            </span>
            🗂 {composite.getTitle()}
          </strong>
          <span style={{ color: styles.badgeColor, fontSize: '0.8rem' }}>
            {composite.getChildCount()} evento(s) · ⏱ {composite.getDurationMinutes()} min
          </span>
        </div>
      )}

      {/* Hijos — solo se renderizan si isOpen es true */}
      {(isRoot || isOpen) && (
        <div style={{ padding: isRoot ? '0' : '8px' }}>
          {composite.getChildren().map((child, index) => (
            <CalendarCompositeCard
              key={index}
              component={child}
              theme={theme}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};