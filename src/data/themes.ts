import { galleries } from './galleries';
import type { GalleryTheme } from './galleries';

export const themeMap: Record<string, GalleryTheme> = Object.fromEntries(
  galleries.map(g => [g.id, g])
);

export function getTheme(id: string): GalleryTheme | undefined {
  return themeMap[id];
}

export function getThemeAccentVars(theme: GalleryTheme): Record<string, string> {
  return {
    '--color-accent': theme.accentColor,
    '--color-accent-dim': theme.accentDim,
  };
}
