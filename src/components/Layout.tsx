import { ReactNode } from 'react';
import { ColorMode } from '../terminal/terminal';

interface LayoutProps {
  colorMode: ColorMode;
  themeClassName: string;
  sidebar?: ReactNode; // File explorer section
  sidebarDivider?: ReactNode; // Vertical divider
  main: ReactNode; // Main content (terminals)
}

export const Layout = ({
  colorMode,
  themeClassName,
  sidebar,
  sidebarDivider,
  main
}: LayoutProps) => {
  return (
    <div className={`container ${themeClassName}`} style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#1e1e1e' }}>
      {/* Sidebar - File Explorer */}
      {sidebar}

      {/* Vertical Divider */}
      {sidebarDivider}

      {/* Main Content - Terminals */}
      {main}
    </div>
  );
};
