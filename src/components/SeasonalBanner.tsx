import { useEffect, useRef, useState } from 'react';
import { getCurrentSeasonalConfig, type SeasonalConfig } from '../lib/themeUtils';
import '../styles/seasonal-banner.css';

const DISMISS_STORAGE_KEY = 'seasonalBannerDismissed';
const COLLAPSE_MS = 500;

// IPython REPL palette, tuned for the dark terminal surface.
const C = {
  prompt: '#56d364', // In[]: green
  promptNum: '#7ee787', // [n] light green
  out: '#ff7b72', // Out[]: red
  fn: '#79c0ff', // function name blue
  str: '#ffa657', // string literal amber
  punc: '#8b949e', // parens / punctuation slate
  message: '#f0f6fc', // output text, near-white
};

/** Minimal tokenizer to syntax-highlight the faux command, e.g. celebrate('pride'). */
function highlightCommand(cmd: string) {
  const tokens: { text: string; color: string }[] = [];
  const re = /('[^']*'|"[^"]*")|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_'"]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cmd)) !== null) {
    if (m[1]) tokens.push({ text: m[1], color: C.str });
    else if (m[2]) tokens.push({ text: m[2], color: C.fn });
    else if (m[3]) tokens.push({ text: m[3], color: C.punc });
    else tokens.push({ text: m[4], color: C.punc });
  }
  return tokens;
}

export default function SeasonalBanner() {
  const [config, setConfig] = useState<SeasonalConfig | null>(null);
  const [open, setOpen] = useState(false);
  const dismissKey = useRef<string>('');
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = getCurrentSeasonalConfig();
    if (!current || !current.banner) return;

    // Re-show the banner each year by scoping dismissal to season id + year.
    const key = `${current.id}-${new Date().getFullYear()}`;
    dismissKey.current = key;

    let dismissed = '';
    try {
      dismissed = localStorage.getItem(DISMISS_STORAGE_KEY) ?? '';
    } catch {
      dismissed = '';
    }
    if (dismissed === key) return;

    setConfig(current);
    // Next frame: flip to open so the height/opacity transition plays.
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, dismissKey.current);
    } catch {
      // Ignore storage failures; the banner will simply reappear next load.
    }
    setOpen(false); // play the collapse animation, then unmount
    collapseTimer.current = setTimeout(() => setConfig(null), COLLAPSE_MS);
  };

  // Escape-to-dismiss, matching the visible `esc` keycap affordance.
  useEffect(() => {
    if (!config) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, [config]);

  if (!config) return null;

  const month = new Date().getMonth() + 1; // 1-12; the cell number, e.g. In [6]
  const strip =
    config.accentGradient ??
    'linear-gradient(to right, var(--theme-primary), var(--theme-secondary), var(--theme-accent))';

  return (
    <div className={`sb-shell ${open ? 'is-open' : ''}`}>
      <div className="sb-clip">
        <div
          className="sb-bar font-mono text-[13px] leading-none text-white"
          role="region"
          aria-label="Seasonal announcement"
        >
          <div className="sb-strip" style={{ background: strip }} aria-hidden="true" />

          <div className="mx-auto flex max-w-7xl items-center gap-x-2.5 gap-y-1 px-4 py-2.5 pr-14 sm:px-6 flex-wrap">
            {/* In [n]: prompt — the cell number is the month */}
            <span className="sb-fade sb-d1 whitespace-nowrap font-semibold tracking-tight">
              <span style={{ color: C.prompt }}>In&nbsp;</span>
              <span style={{ color: C.punc }}>[</span>
              <span style={{ color: C.promptNum }}>{month}</span>
              <span style={{ color: C.punc }}>]</span>
              <span style={{ color: C.prompt }}>:</span>
            </span>

            {/* faux command, syntax-highlighted; hidden on the smallest screens */}
            {config.command && (
              <code className="sb-fade sb-d2 hidden whitespace-nowrap sm:inline">
                {highlightCommand(config.command).map((t, i) => (
                  <span key={i} style={{ color: t.color }}>
                    {t.text}
                  </span>
                ))}
              </code>
            )}

            {/* Out [n]: result prompt, IPython red */}
            <span
              className="sb-fade sb-d3 hidden whitespace-nowrap font-semibold tracking-tight sm:inline"
              style={{ color: C.out }}
              aria-hidden="true"
            >
              Out[{month}]:
            </span>

            {/* the message itself — the cell's output */}
            <span className="sb-fade sb-d3 font-medium" style={{ color: C.message }}>
              {config.banner}
              <span className="sb-cursor ml-1.5" aria-hidden="true" />
            </span>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            title="Dismiss (Esc)"
            className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center rounded-md border border-white/25 bg-white/5 px-2 py-1 text-[11px] font-medium leading-none text-white/70 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            esc
          </button>
        </div>
      </div>
    </div>
  );
}
