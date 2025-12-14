import { ReactNode, CSSProperties } from 'react';

interface InfoBoxProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Generic info-box component for displaying any boxed content
 * Used for file explorer, terminal gutters, settings, etc.
 */
export const InfoBox = ({ children, style, className }: InfoBoxProps) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  );
};
