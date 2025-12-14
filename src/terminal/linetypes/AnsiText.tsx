import React from 'react';

interface AnsiSpan {
  text: string;
  color?: string;
}

/**
 * Parse ANSI color codes and return styled spans
 */
function parseAnsiColors(text: string): AnsiSpan[] {
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\x1b\[([0-9;]*)m/g;
  const spans: AnsiSpan[] = [];
  let lastIndex = 0;
  let currentColor: string | undefined;

  let match;
  while ((match = ansiRegex.exec(text)) !== null) {
    // Add text before this code
    if (match.index > lastIndex) {
      spans.push({
        text: text.substring(lastIndex, match.index),
        color: currentColor,
      });
    }

    // Parse the color code
    const code = match[1];
    if (code === '0') {
      // Reset
      currentColor = undefined;
    } else {
      // Map ANSI color codes to CSS
      currentColor = getColorStyle(code);
    }

    lastIndex = ansiRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    spans.push({
      text: text.substring(lastIndex),
      color: currentColor,
    });
  }

  return spans;
}

/**
 * Convert ANSI code to CSS color
 */
function getColorStyle(code: string): string | undefined {
  const colorMap: { [key: string]: string } = {
    '30': '#808080', // Black
    '31': '#ff6b6b', // Red
    '32': '#51cf66', // Green
    '33': '#ffd93d', // Yellow
    '34': '#6bcfff', // Blue
    '35': '#ff88ee', // Magenta
    '36': '#4dd9ff', // Cyan
    '37': '#ffffff', // White
    '90': '#666666', // Bright Black
    '91': '#ff8787', // Bright Red
    '92': '#69f0ae', // Bright Green
    '93': '#ffff00', // Bright Yellow
    '94': '#5c7cfa', // Bright Blue
    '95': '#ff00ff', // Bright Magenta
    '96': '#00ffff', // Bright Cyan
    '97': '#ffffff', // Bright White
  };

  return colorMap[code];
}

interface Props {
  children: string;
}

const AnsiText: React.FC<Props> = ({ children }) => {
  const spans = parseAnsiColors(children);

  return (
    <span>
      {spans.map((span, i) => (
        <span key={i} style={span.color ? { color: span.color } : undefined}>
          {span.text}
        </span>
      ))}
    </span>
  );
};

export default AnsiText;
