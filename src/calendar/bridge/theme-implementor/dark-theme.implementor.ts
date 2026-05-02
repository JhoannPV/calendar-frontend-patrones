// src/calendar/bridge/theme-implementor/dark-theme.implementor.ts

import type { IThemeImplementor, ThemeStyles } from './theme.implementor.interface';

export class DarkThemeImplementor implements IThemeImplementor {
  getStyles(): ThemeStyles {
    return {
      cardBackground: '#2b2d42',
      cardBorder: '1px solid #495057',
      titleColor: '#f8f9fa',
      subtitleColor: '#adb5bd',
      badgeBackground: '#4cc9f0',
      badgeColor: '#212529',
    };
  }

  getThemeName(): string {
    return 'dark';
  }
}