// src/calendar/bridge/theme-implementor/theme.implementor.interface.ts

export interface ThemeStyles {
  cardBackground: string;
  cardBorder: string;
  titleColor: string;
  subtitleColor: string;
  badgeBackground: string;
  badgeColor: string;
}

export interface IThemeImplementor {
  getStyles(): ThemeStyles;
  getThemeName(): string;
}