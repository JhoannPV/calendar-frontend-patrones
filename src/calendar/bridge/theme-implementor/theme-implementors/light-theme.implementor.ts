// src/calendar/bridge/theme-implementor/light-theme.implementor.ts

import type { IThemeImplementor, ThemeStyles } from '../theme-interface/theme.implementor.interface';

export class LightThemeImplementor implements IThemeImplementor {
  getStyles(): ThemeStyles {
    return {
      cardBackground: '#ffffff',
      cardBorder: '1px solid #dee2e6',
      titleColor: '#212529',
      subtitleColor: '#6c757d',
      badgeBackground: '#0d6efd',
      badgeColor: '#ffffff',
    };
  }

  getThemeName(): string {
    return 'light';
  }
}