import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import ScreenState from './demo/screenState';
import DevGate from './dev/DevGate';

// Responsive font sizing: ensure at least 40 lines fit on screen
const updateFontSize = () => {
  const viewportHeight = window.innerHeight;
  const lineHeight = 1.4;
  const targetLines = 40;
  const calculatedSize = viewportHeight / (targetLines * lineHeight);
  const fontSize = Math.max(12, Math.min(calculatedSize, 20));
  document.documentElement.style.fontSize = `${fontSize}px`;
  document.documentElement.style.setProperty('--fontsize', `${fontSize}px`);
};

updateFontSize();
window.addEventListener('resize', updateFontSize);

function App() {
  const [devMode, setDevMode] = useState(
    window.location.pathname === '/dev' || window.location.hash === '#dev'
  );

  const enterDev = () => {
    window.history.pushState({}, '', '/dev');
    setDevMode(true);
  };

  const exitDev = () => {
    window.history.pushState({}, '', '/');
    setDevMode(false);
  };

  // Ctrl+D anywhere on the main site enters dev mode
  useEffect(() => {
    if (devMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); enterDev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devMode]);

  if (devMode) return <DevGate onExit={exitDev} />;
  return <ScreenState />;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
