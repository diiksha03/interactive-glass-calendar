'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type ThemeMode = 'night' | 'mist';

type CalendarDay = {
  iso: string;
  label: number;
  inCurrentMonth: boolean;
  date: Date;
};

const STORAGE_KEY = 'interactive-calendar-state-v1';
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthArtwork = [
  {
    title: 'Winter Aurora',
    subtitle: 'Fresh starts, clean focus, and bright intentions.',
    style: {
      background:
        'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.9) 0 4%, transparent 4.5%), radial-gradient(circle at 78% 20%, rgba(156,255,227,0.78), transparent 18%), radial-gradient(circle at 55% 0%, rgba(104,149,255,0.6), transparent 30%), linear-gradient(180deg, rgba(12,31,78,0.15), rgba(7,14,30,0.56)), linear-gradient(135deg, #8fd3ff 0%, #4d7cff 32%, #182848 70%, #070b16 100%)',
    },
  },
  {
    title: 'Rose Dawn',
    subtitle: 'Soft energy for steady progress through the month.',
    style: {
      background:
        'radial-gradient(circle at 72% 24%, rgba(255,240,186,0.82), transparent 14%), radial-gradient(circle at 25% 30%, rgba(255,180,214,0.62), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(25,18,44,0.34)), linear-gradient(135deg, #ffcad4 0%, #f4acb7 24%, #9d4edd 60%, #3c096c 100%)',
    },
  },
  {
    title: 'Mint Horizon',
    subtitle: 'A lighter season to map ideas and daily momentum.',
    style: {
      background:
        'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.78), transparent 10%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.45), transparent 16%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(4,24,28,0.35)), linear-gradient(135deg, #d9fff8 0%, #89f7d1 28%, #1cc5dc 62%, #0c6170 100%)',
    },
  },
  {
    title: 'Bloom Light',
    subtitle: 'Plan with optimism, color, and room to grow.',
    style: {
      background:
        'radial-gradient(circle at 76% 22%, rgba(255,248,190,0.86), transparent 14%), radial-gradient(circle at 20% 32%, rgba(255,187,218,0.72), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(18,17,48,0.32)), linear-gradient(135deg, #ffe29f 0%, #ffa99f 28%, #c77dff 62%, #6a4c93 100%)',
    },
  },
  {
    title: 'Golden Drift',
    subtitle: 'Warm highlights for thoughtful planning and notes.',
    style: {
      background:
        'radial-gradient(circle at 76% 22%, rgba(255,252,201,0.86), transparent 15%), radial-gradient(circle at 22% 26%, rgba(255,189,89,0.52), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(34,18,8,0.34)), linear-gradient(135deg, #fff0a8 0%, #ffd166 30%, #f77f00 60%, #7b2d26 100%)',
    },
  },
  {
    title: 'Ocean Pulse',
    subtitle: 'Balanced structure with vibrant movement and calm.',
    style: {
      background:
        'radial-gradient(circle at 70% 22%, rgba(209,255,253,0.82), transparent 14%), radial-gradient(circle at 22% 26%, rgba(88,166,255,0.42), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(8,18,45,0.36)), linear-gradient(135deg, #d2f4ff 0%, #72ddf7 26%, #3f8efc 58%, #2b2d42 100%)',
    },
  },
  {
    title: 'Solar Blue',
    subtitle: 'Bold mid-year clarity for goals, trips, and milestones.',
    style: {
      background:
        'radial-gradient(circle at 75% 24%, rgba(255,229,145,0.85), transparent 13%), radial-gradient(circle at 24% 32%, rgba(136,222,255,0.46), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(7,13,34,0.35)), linear-gradient(135deg, #fde68a 0%, #38bdf8 28%, #2563eb 56%, #172554 100%)',
    },
  },
  {
    title: 'Neon Coast',
    subtitle: 'A vivid planning canvas for busy and ambitious weeks.',
    style: {
      background:
        'radial-gradient(circle at 22% 24%, rgba(255,255,255,0.7), transparent 10%), radial-gradient(circle at 76% 26%, rgba(135,255,241,0.82), transparent 14%), linear-gradient(180deg, rgba(255,255,255,0.07), rgba(12,10,31,0.34)), linear-gradient(135deg, #d9f99d 0%, #22d3ee 25%, #7c3aed 62%, #312e81 100%)',
    },
  },
  {
    title: 'Harvest Glow',
    subtitle: 'Cozy tones for routines, reflection, and steady wins.',
    style: {
      background:
        'radial-gradient(circle at 75% 24%, rgba(255,238,181,0.86), transparent 14%), radial-gradient(circle at 28% 34%, rgba(255,141,90,0.44), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(29,13,5,0.33)), linear-gradient(135deg, #fef3c7 0%, #fb923c 32%, #ea580c 58%, #7c2d12 100%)',
    },
  },
  {
    title: 'Crimson Sky',
    subtitle: 'Sharper contrast for focused planning and deadlines.',
    style: {
      background:
        'radial-gradient(circle at 74% 23%, rgba(255,225,149,0.84), transparent 13%), radial-gradient(circle at 18% 30%, rgba(255,131,131,0.42), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(23,6,13,0.34)), linear-gradient(135deg, #ffe29a 0%, #ff7b7b 24%, #c9184a 58%, #3a0f2b 100%)',
    },
  },
  {
    title: 'Plum Night',
    subtitle: 'A moody, elegant view for wrapping up the year well.',
    style: {
      background:
        'radial-gradient(circle at 22% 24%, rgba(255,255,255,0.65), transparent 10%), radial-gradient(circle at 76% 22%, rgba(240,190,255,0.54), transparent 16%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(14,10,33,0.35)), linear-gradient(135deg, #e9d5ff 0%, #c084fc 26%, #7e22ce 58%, #240046 100%)',
    },
  },
  {
    title: 'Festive Frost',
    subtitle: 'Bright endings, clean resets, and a calm year close.',
    style: {
      background:
        'radial-gradient(circle at 74% 22%, rgba(255,244,194,0.85), transparent 13%), radial-gradient(circle at 24% 30%, rgba(179,226,255,0.46), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(7,14,34,0.36)), linear-gradient(135deg, #dcfce7 0%, #93c5fd 28%, #2563eb 56%, #0f172a 100%)',
    },
  },
] as const;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toISO(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromISO(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function fullDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function buildMonthGrid(anchor: Date): CalendarDay[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      iso: toISO(date),
      label: date.getDate(),
      inCurrentMonth: date.getMonth() === anchor.getMonth(),
      date,
    };
  });
}

function compareISO(a: string, b: string) {
  return a.localeCompare(b);
}

export default function InteractiveWallCalendar() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [displayDate, setDisplayDate] = useState(() => new Date(2026, 6, 1));
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [theme, setTheme] = useState<ThemeMode>('night');
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        selectedStart: string | null;
        selectedEnd: string | null;
        notes: string;
        theme: ThemeMode;
        displayDate: string;
      };
      if (parsed.displayDate) setDisplayDate(fromISO(parsed.displayDate));
      if (parsed.selectedStart) setSelectedStart(parsed.selectedStart);
      if (parsed.selectedEnd) setSelectedEnd(parsed.selectedEnd);
      if (typeof parsed.notes === 'string') setNotes(parsed.notes);
      if (parsed.theme === 'night' || parsed.theme === 'mist') setTheme(parsed.theme);
    } catch {
      // Ignore malformed localStorage.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedStart,
        selectedEnd,
        notes,
        theme,
        displayDate: toISO(displayDate),
      }),
    );
  }, [displayDate, selectedEnd, selectedStart, notes, theme]);

  const days = useMemo(() => buildMonthGrid(displayDate), [displayDate]);
  const todayISO = toISO(startOfDay(new Date()));
  const monthText = monthLabel(displayDate);
  const activeArtwork = monthArtwork[displayDate.getMonth()];

  const rangeText = useMemo(() => {
    if (!selectedStart && !selectedEnd) {
      return `Nothing selected yet. These notes will apply to ${monthText}.`;
    }

    if (selectedStart && !selectedEnd) {
      return `Start selected: ${fullDate(fromISO(selectedStart))}. Pick an end date.`;
    }

    if (selectedStart && selectedEnd) {
      return `${fullDate(fromISO(selectedStart))} → ${fullDate(fromISO(selectedEnd))}`;
    }

    return '';
  }, [monthText, selectedEnd, selectedStart]);

  function handleDayClick(iso: string) {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(iso);
      setSelectedEnd(null);
      return;
    }

    if (compareISO(iso, selectedStart) < 0) {
      setSelectedEnd(selectedStart);
      setSelectedStart(iso);
      return;
    }

    setSelectedEnd(iso);
  }

  function resetSelection() {
    setSelectedStart(null);
    setSelectedEnd(null);
  }

  function goToMonth(offset: number) {
    setDisplayDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function goToToday() {
    const today = new Date();
    setDisplayDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function isInRange(iso: string) {
    if (!selectedStart || !selectedEnd) return false;
    return compareISO(iso, selectedStart) >= 0 && compareISO(iso, selectedEnd) <= 0;
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const node = cardRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    setTilt({
      rotateX: (0.5 - py) * 10,
      rotateY: (px - 0.5) * 14,
      glareX: px * 100,
      glareY: py * 100,
    });
  }

  function resetTilt() {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  }

  return (
    <section className={`calendar-scene ${theme}`}>
      <div className="stars stars-a" />
      <div className="stars stars-b" />
      <div className="nebula nebula-left" />
      <div className="nebula nebula-bottom" />

      <div
        ref={cardRef}
        className="glass-calendar"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{
          transform: `perspective(1800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        <div
          className="glass-glare"
          style={{ background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.26), transparent 28%)` }}
        />

        <div className="panel hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Current view</p>
            <h1>Plan the month with clarity and calm.</h1>
            <div className="hero-month-card">
              <span className="mini-label">Current View</span>
              <h2>{monthText}</h2>
              <p>Pick a date range by clicking start and end. Add notes to stay organized.</p>
            </div>
          </div>

          <div className="hero-visual-card" style={activeArtwork.style}>
            <div className="hero-visual-overlay" />
            <div className="hero-visual-content">
              <span className="mini-label">Monthly Artwork</span>
              <h3>{activeArtwork.title}</h3>
              <p>{activeArtwork.subtitle}</p>
            </div>
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="orb orb-three" />
            <div className="ridge ridge-one" />
            <div className="ridge ridge-two" />
          </div>
        </div>

        <div className="panel grid-panel">
          <div className="panel-topbar">
            <div>
              <p className="section-label">Range</p>
              <p className="section-summary">Pick a date range by clicking start and end. Add notes to stay organized.</p>
            </div>

            <div className="controls-row">
              <button type="button" className="nav-btn" onClick={() => goToMonth(-1)}>
                Prev
              </button>
              <button type="button" className="nav-btn today-btn" onClick={goToToday}>
                Today
              </button>
              <button type="button" className="nav-btn" onClick={() => goToMonth(1)}>
                →
              </button>
            </div>
          </div>

          <div className="weekday-row">
            {weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map((day) => {
              const isStart = day.iso === selectedStart;
              const isEnd = day.iso === selectedEnd;
              const withinRange = isInRange(day.iso);
              const isToday = day.iso === todayISO;

              return (
                <button
                  key={day.iso}
                  type="button"
                  className={[
                    'day-cell',
                    day.inCurrentMonth ? 'current-month' : 'outside-month',
                    withinRange ? 'within-range' : '',
                    isStart ? 'range-start' : '',
                    isEnd ? 'range-end' : '',
                    isToday ? 'today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleDayClick(day.iso)}
                  aria-label={fullDate(day.date)}
                >
                  <span>{day.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="panel notes-panel">
          <div className="notes-header">
            <div>
              <h2>Monthly Notes</h2>
            </div>
            <button
              type="button"
              className={`theme-toggle ${theme === 'mist' ? 'active' : ''}`}
              onClick={() => setTheme((current) => (current === 'night' ? 'mist' : 'night'))}
              aria-label="Toggle theme"
            >
              <span className="toggle-star">✦</span>
              <span className="toggle-thumb" />
            </button>
          </div>

          <div className="note-status-card">
            <p>{rangeText}</p>
          </div>

          <label className="notes-editor">
            <span className="sr-only">Monthly notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Write reminders, trip plans, sprint goals, or anything you want to remember..."
            />
          </label>

          <div className="meta-grid">
            <div className="meta-card">
              <span className="meta-title">Interaction hint</span>
              <p>Click once to choose a start date. Click again to set the end date.</p>
            </div>
            <div className="meta-card">
              <span className="meta-title">Built for devices</span>
              <p>Desktop uses a multi-panel wall calendar composition. Mobile stacks the hero, grid, and notes for touch.</p>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="action-btn" onClick={resetSelection}>
              Reset Range
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
