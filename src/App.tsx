import { useEffect, useState } from 'react';
import Terminal from './Terminal';
import { me81 } from './content/pics';
import { DEFAULT_THEME, THEMES } from './themes';

function savedTheme(): string {
  try {
    const t = localStorage.getItem('theme');
    if (t && THEMES.includes(t)) return t;
  } catch {
    // storage unavailable
  }
  return DEFAULT_THEME;
}

// Like the 2022 site: portrait, "Hello, World!", press any key.
function StartScreen({ onStart }: { onStart(): void }) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      onStart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);

  return (
    <main className="start" onClick={onStart}>
      <pre className="art">{me81.slice(0, -1).join('\n')}</pre>
      <h1>Hello, World!</h1>
      <p className="blink">Press any key to start</p>
    </main>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [theme, setThemeState] = useState(savedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // storage unavailable
    }
  }, [theme]);

  const setTheme = (t: string) => {
    if (!THEMES.includes(t)) return false;
    setThemeState(t);
    return true;
  };

  if (!started) return <StartScreen onStart={() => setStarted(true)} />;
  return <Terminal setTheme={setTheme} />;
}
