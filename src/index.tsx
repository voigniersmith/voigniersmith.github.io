import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import ScreenState from './demo/screenState';

// Responsive font sizing: ensure at least 90 lines fit on screen
const updateFontSize = () => {
  const viewportHeight = window.innerHeight;
  const lineHeight = 1.4;
  const targetLines = 40;

  // Calculate font size: viewportHeight / (targetLines * lineHeight)
  // Clamped between 12px and 20px
  const calculatedSize = viewportHeight / (targetLines * lineHeight);
  const fontSize = Math.max(12, Math.min(calculatedSize, 20));

  document.documentElement.style.fontSize = `${fontSize}px`;
  document.documentElement.style.setProperty('--fontsize', `${fontSize}px`);
};

// Set initial font size
updateFontSize();

// Update font size on window resize
window.addEventListener('resize', updateFontSize);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ScreenState />
  </React.StrictMode>
);

reportWebVitals();
