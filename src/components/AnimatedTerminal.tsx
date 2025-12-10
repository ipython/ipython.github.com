import { useEffect, useState, useMemo, useRef } from 'react';

type TerminalExample = {
  name: string;
  lines: string[];
  delay: number; // Delay before starting next example
};

interface AnimatedTerminalProps {
  version?: string | null;
}

const getExamples = (version: string = '9.8.0'): TerminalExample[] => [
  {
    name: 'NumPy Basics',
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
    name: 'Performance & Plotting',
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
    name: 'Functions',
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
  const [isVisible, setIsVisible] = useState(true);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      isVisibleRef.current = visible;
      setIsVisible(visible);
    };

    const handleWindowBlur = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const handleWindowFocus = () => {
      const visible = !document.hidden;
      isVisibleRef.current = visible;
      setIsVisible(visible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    const initialVisible = !document.hidden && document.hasFocus();
    isVisibleRef.current = initialVisible;
    setIsVisible(initialVisible);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Function to switch to a specific example
  const switchToExample = (index: number) => {
    if (index >= 0 && index < examples.length) {
      setCurrentExample(index);
      setCurrentLineIndex(0);
      setDisplayedLines([]);
    }
  };

  useEffect(() => {
    // Pause animation when page is not visible
    if (!isVisible) {
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
  }, [currentExample, currentLineIndex, examples, isVisible]);

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
    <div>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden font-mono text-sm" style={{ minHeight }}>
        {/* macOS Window Controls */}
        <div className="bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        
        {/* Terminal Content */}
        <div className="p-6 whitespace-pre">
          {displayedLines.map((line, index) => {
            const { prefix, content, prefixColor } = getLinePrefix(line);
            const lineColor = getLineColor(line);

            return (
              <div key={index} className={`${lineColor} whitespace-pre`}>
                {prefix && <span className={prefixColor}>{prefix}</span>}
                {content}
              </div>
            );
          })}
          {displayedLines.length === 0 && (
            <div className="text-theme-secondary whitespace-pre">$ ipython</div>
          )}
        </div>
      </div>
      
      {/* Indicator Dots */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => switchToExample(index)}
            className={`transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 rounded-full ${
              index === currentExample
                ? 'w-3 h-3 bg-theme-accent border-2 border-theme-primary scale-125'
                : 'w-2 h-2 bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500'
            }`}
            aria-label={`Go to ${example.name}`}
            title={example.name}
          />
        ))}
      </div>
    </div>
  );
}
