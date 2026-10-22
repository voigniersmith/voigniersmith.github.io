import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { complete, Ctx, Line, runLine } from './commands';
import { start } from './content/text';
import { HOME } from './fs';

interface Ask {
  label: string;
  resolve(value: string | null): void;
}

interface Props {
  setTheme(theme: string): boolean;
}

const toLine = (l: string | Line): Line => (typeof l === 'string' ? { text: l } : l);

export default function Terminal({ setTheme }: Props) {
  const [lines, setLines] = useState<Line[]>(() => start.map(toLine));
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState(HOME);
  const [history, setHistory] = useState<string[]>([]);
  const [histPos, setHistPos] = useState<number | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const prompt = `guest@voigniersmith:${cwd}$ `;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lines, busy, ask]);

  useEffect(() => {
    if (!busy || ask) inputRef.current?.focus();
  }, [busy, ask]);

  const print = (...more: (string | Line)[]) => setLines((prev) => [...prev, ...more.map(toLine)]);

  const submit = async () => {
    const value = input;
    setInput('');
    if (ask) {
      print({ text: ask.label + value, kind: 'input' });
      setAsk(null);
      ask.resolve(value);
      return;
    }
    print({ text: prompt + value, kind: 'input' });
    const nextHistory = value.trim() ? [...history, value] : history;
    setHistory(nextHistory);
    setHistPos(null);

    const ctx: Ctx = {
      cwd,
      setCwd,
      print,
      clear: () => setLines([]),
      ask: (label) => new Promise((resolve) => setAsk({ label, resolve })),
      history: nextHistory,
      setTheme,
    };
    setBusy(true);
    try {
      await runLine(value, ctx);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (ask && (e.key === 'Escape' || (e.ctrlKey && e.key === 'c'))) {
      e.preventDefault();
      print({ text: ask.label + input + '^C', kind: 'input' });
      setInput('');
      setAsk(null);
      ask.resolve(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!ask) setInput(complete(input, cwd));
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setLines([]);
    } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !ask && history.length) {
      e.preventDefault();
      const up = e.key === 'ArrowUp';
      const pos = histPos ?? history.length;
      const next = Math.min(history.length, Math.max(0, pos + (up ? -1 : 1)));
      setHistPos(next);
      setInput(history[next] ?? '');
    }
  };

  // Tapping anywhere focuses the input (opens the keyboard on phones),
  // unless the visitor is selecting text to copy.
  const focus = () => {
    if (!window.getSelection()?.toString()) inputRef.current?.focus();
  };

  const showInput = !busy || ask;

  return (
    <main className="terminal" onClick={focus}>
      {lines.map((l, i) => (
        <div key={i} className={`line ${l.kind ?? ''}`}>
          {l.href ? (
            <a href={l.href} target="_blank" rel="noopener noreferrer">
              {l.text}
            </a>
          ) : (
            l.text || ' '
          )}
        </div>
      ))}
      {showInput && (
        <label className="line input prompt">
          <span>{ask ? ask.label : prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint={ask ? 'next' : 'go'}
            aria-label={ask ? ask.label : 'command'}
          />
        </label>
      )}
      <div ref={bottomRef} />
    </main>
  );
}
