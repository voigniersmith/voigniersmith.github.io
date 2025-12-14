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

  console.log(`Font sizing: viewport=${viewportHeight}px, calculated=${calculatedSize.toFixed(2)}px, final=${fontSize.toFixed(2)}px`);

  document.documentElement.style.fontSize = `${fontSize}px`;
  // Also update the terminal CSS variable so it respects responsive sizing
  document.documentElement.style.setProperty('--fontsize', `${fontSize}px`);

  // Debug: verify the values were set
  const htmlElement = document.documentElement;
  console.log(`Applied: font-size=${htmlElement.style.fontSize}, --fontsize=${htmlElement.style.getPropertyValue('--fontsize')}`);
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
