import { useEffect, useState, useMemo, useRef } from 'react';

type TerminalExample = {
  lines: string[];
  delay: number; // Delay before starting next example
};

interface AnimatedTerminalProps {
  version?: string | null;
}

const getExamples = (version: string = '9.8.0'): TerminalExample[] => [
  {
    lines: [
      '$ ipython',
      `IPython ${version} -- An enhanced Interactive Python`,
      "Type 'copyright', 'credits' or 'license' for more information",
      '',
      'In [1]: import numpy as np',
      '',
      'In [2]: data = np.array([1, 2, 3, 4, 5])',
      '',
      'In [3]: data.mean()',
      'Out[3]: 3.0',
    ],
    delay: 4000,
  },
  {
    lines: [
      '$ ipython',
      `IPython ${version} -- An enhanced Interactive Python`,
      '',
      'In [1]: %timeit sum(range(1000))',
      '14.2 µs ± 245 ns per loop (mean ± std. dev. of 7 runs, 100,000 loops each)',
      '',
      'In [2]: %matplotlib inline',
      '',
      'In [3]: import matplotlib.pyplot as plt',
    ],
    delay: 4000,
  },
  {
    lines: [
      '$ ipython',
      `IPython ${version} -- An enhanced Interactive Python`,
      '',
      'In [1]: def fibonacci(n):',
      '   ...:     if n <= 1:',
      '   ...:         return n',
      '   ...:     return fibonacci(n-1) + fibonacci(n-2)',
      '   ...: ',
      '',
      'In [2]: fibonacci(10)',
      'Out[2]: 55',
    ],
    delay: 4000,
  },
];

export default function AnimatedTerminal({ version }: AnimatedTerminalProps) {
  const examples = useMemo(() => getExamples(version || undefined), [version]);
  const [currentExample, setCurrentExample] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    const handleWindowBlur = () => {
      isVisibleRef.current = false;
    };

    const handleWindowFocus = () => {
      isVisibleRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    isVisibleRef.current = !document.hidden && document.hasFocus();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    // Pause animation when page is not visible
    if (!isVisibleRef.current) {
      return;
    }

    const example = examples[currentExample];
    if (!example) return;

    const lineDelay = 400; // delay between lines appearing

    if (currentLineIndex < example.lines.length) {
      // Show next line
      const timer = setTimeout(() => {
        if (isVisibleRef.current) {
          setDisplayedLines((prev) => [...prev, example.lines[currentLineIndex]]);
          setCurrentLineIndex((prev) => prev + 1);
        }
      }, lineDelay);

      return () => clearTimeout(timer);
    } else {
      // All lines displayed, wait then cycle to next example
      const timer = setTimeout(() => {
        if (isVisibleRef.current) {
          setCurrentExample((prev) => (prev + 1) % examples.length);
          setCurrentLineIndex(0);
          setDisplayedLines([]);
        }
      }, example.delay);

      return () => clearTimeout(timer);
    }
  }, [currentExample, currentLineIndex, examples]);

  const getLinePrefix = (line: string): { prefix: string; content: string; prefixColor: string } => {
    if (line.startsWith('In [')) {
      const match = line.match(/^(In \[\d+\]:\s*)(.*)$/);
      if (match) {
        return { prefix: match[1], content: match[2], prefixColor: 'text-theme-primary' };
      }
    }
    if (line.startsWith('Out[')) {
      const match = line.match(/^(Out\[\d+\]:\s*)(.*)$/);
      if (match) {
        return { prefix: match[1], content: match[2], prefixColor: 'text-theme-accent' };
      }
    }
    if (line.startsWith('   ...:')) {
      return { prefix: '   ...: ', content: line.substring(8), prefixColor: 'text-gray-500 dark:text-gray-400' };
    }
    return { prefix: '', content: line, prefixColor: '' };
  };

  const getLineColor = (line: string): string => {
    if (line.startsWith('$')) {
      return 'text-theme-secondary';
    }
    if (line.startsWith('Out[')) {
      return 'text-theme-accent';
    }
    if (line.startsWith('IPython') || line.includes('Type')) {
      return 'text-gray-600 dark:text-gray-300';
    }
    if (line.trim() === '') {
      return 'text-gray-500 dark:text-gray-400';
    }
    return 'text-gray-700 dark:text-gray-300';
  };

  // Calculate max height based on the longest example
  const maxLines = Math.max(...examples.map(ex => ex.lines.length));
  const lineHeight = 1.5; // rem (24px for text-sm)
  const padding = 1.5 * 2; // rem (top + bottom padding)
  const controlsHeight = 2.5; // rem (window controls height)
  const minHeight = `${maxLines * lineHeight + padding + controlsHeight}rem`;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden font-mono text-sm" style={{ minHeight }}>
      {/* macOS Window Controls */}
      <div className="bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      
      {/* Terminal Content */}
      <div className="p-6">
        {displayedLines.map((line, index) => {
          const { prefix, content, prefixColor } = getLinePrefix(line);
          const lineColor = getLineColor(line);

          return (
            <div key={index} className={lineColor}>
              {prefix && <span className={prefixColor}>{prefix}</span>}
              {content}
            </div>
          );
        })}
        {displayedLines.length === 0 && (
          <div className="text-theme-secondary">$ ipython</div>
        )}
      </div>
    </div>
  );
}
