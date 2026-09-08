import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = { tablet: 600, desktop: 1024 };

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWide = isTablet; // di atas ini pakai side nav, bukan bottom tab
  const columns = isDesktop ? 4 : isTablet ? 3 : 2;
  const maxContentWidth = isDesktop ? 1080 : isTablet ? 760 : undefined;
  return { width, isTablet, isDesktop, isWide, columns, maxContentWidth };
}
