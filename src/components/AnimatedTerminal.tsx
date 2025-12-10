import { useEffect, useState, useMemo, useRef } from "react";

type TerminalExample = {
  name: string;
  lines: string[];
};

interface AnimatedTerminalProps {
  version?: string | null;
}

/**
 * Dedent a multiline string by removing common leading whitespace
 * and split it into lines
 */
function dedentAndSplit(text: string): string[] {
  const lines = text.split("\n");

  // Trim leading and trailing empty lines
  while (lines.length > 0 && lines[0].trim().length === 0) {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }

  // Find the minimum indentation (excluding empty lines)
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length > 0) {
      const indent = line.match(/^(\s*)/)?.[1].length || 0;
      minIndent = Math.min(minIndent, indent);
    }
  }

  // If no indentation found, return lines as-is
  if (minIndent === Infinity) {
    return lines;
  }

  // Remove the common indentation from all lines
  return lines.map((line) => {
    if (line.trim().length === 0) {
      return "";
    }
    return line.slice(minIndent);
  });
}

const getExamples = (version: string = "9.8.0"): TerminalExample[] => [
  {
    name: "NumPy Basics",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
      Type 'copyright', 'credits' or 'license' for more information
      
      In [1]: import numpy as np
      
      In [2]: data = np.array([1, 2, 3, 4, 5])
      
      In [3]: data.mean()
      Out[3]: 3.0
    `),
  },
  {
    name: "Performance & Plotting",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
      
      In [1]: %timeit sum(range(1000))
      14.2 µs ± 245 ns per loop (mean ± std. dev. of 7 runs, 100,000 loops each)
      
      In [2]: %matplotlib inline
      
      In [3]: import matplotlib.pyplot as plt
    `),
  },
  {
    name: "Functions",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
      
      In [1]: def fibonacci(n):
         ...:     if n <= 1:
         ...:         return n
         ...:     return fibonacci(n-1) + fibonacci(n-2)
         ...: 
      
      In [2]: fibonacci(10)
      Out[2]: 55
    `),
  },
  {
    name: "Async",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
    
      In [1]: # we will use await at top level !
         ...: import asyncio
      
      In [2]: async def fetch_data():
         ...:     await asyncio.sleep(0.1)
         ...:     return "Data fetched!"
         ...: 

      In [3]: await fetch_data()
      Out[3]: 'Data fetched!'
      
      In [4]: async def process_items(items):
         ...:     results = []
         ...:     for item in items:
         ...:         await asyncio.sleep(0.05)
         ...:         results.append(item * 2)
         ...:     return results
      
      In [5]: await process_items([1, 2, 3])
      Out[5]: [2, 4, 6]
    `),
  },
  {
    name: "Object Introspection",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
      
      In [1]: import json
      
      In [2]: json.dumps?
      Signature: json.dumps(obj, *, skipkeys=False, ensure_ascii=True, ...)
      Docstring: Serialize obj to a JSON formatted str.
      
      In [3]: json.dumps??
      Source:
      def dumps(obj, *, skipkeys=False, ensure_ascii=True, ...):
          return _default_encoder.encode(obj)
    `),
  },
  {
    name: "History System",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
      
      In [1]: x = 42
      
      In [2]: y = x * 2
      
      In [3]: y
      Out[3]: 84
      
      In [4]: _
      Out[4]: 84
      
      In [5]: _ih[1]
      Out[5]: 'y = x * 2'
    `),
  },
  {
    name: "System Integration",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
      
      In [1]: !echo "Hello from shell"
      Hello from shell
      
      In [2]: files = !ls *.py
      
      In [3]: len(files)
      Out[3]: 5
      
      In [4]: %cd /tmp
      /tmp
    `),
  },
  {
    name: "Magic Commands",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
      
      In [1]: def slow_func():
         ...:     return sum(range(10000))
         ...: 
      
      In [2]: %timeit slow_func()
      245 µs ± 12.3 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)
      
      In [3]: %prun slow_func()
           5 function calls in 0.000 seconds
    `),
  },
  {
    name: "Data Science",
    lines: dedentAndSplit(`
      $ ipython
      IPython ${version} -- An enhanced Interactive Python
      
      In [1]: import pandas as pd
      
      In [2]: df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
      
      In [3]: df.describe()
      Out[3]: 
                 A         B
      count  3.000000  3.000000
      mean   2.000000  5.000000
      std    1.000000  1.000000
    `),
  },
];

const EXAMPLE_DELAY = 4000; // Delay before starting next example

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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    const initialVisible = !document.hidden && document.hasFocus();
    isVisibleRef.current = initialVisible;
    setIsVisible(initialVisible);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
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

    const baseLineDelay = 300; // delay between lines appearing
    const currentLine = example.lines[currentLineIndex];
    // Add 100ms delay for empty lines
    const lineDelay =
      currentLine && currentLine.trim().length === 0
        ? baseLineDelay + 300
        : baseLineDelay;

    if (currentLineIndex < example.lines.length) {
      // Show next line
      const timer = setTimeout(() => {
        if (isVisibleRef.current) {
          setDisplayedLines((prev) => [
            ...prev,
            example.lines[currentLineIndex],
          ]);
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
      }, EXAMPLE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [currentExample, currentLineIndex, examples, isVisible]);

  const getLinePrefix = (
    line: string
  ): { prefix: string; content: string; prefixColor: string } => {
    if (line.startsWith("In [")) {
      const match = line.match(/^(In \[\d+\]:\s*)(.*)$/);
      if (match) {
        return {
          prefix: match[1],
          content: match[2],
          prefixColor: "text-theme-primary",
        };
      }
    }
    if (line.startsWith("Out[")) {
      const match = line.match(/^(Out\[\d+\]:\s*)(.*)$/);
      if (match) {
        return {
          prefix: match[1],
          content: match[2],
          prefixColor: "text-theme-accent",
        };
      }
    }
    if (line.startsWith("   ...:")) {
      return {
        prefix: "   ...: ",
        content: line.substring(8),
        prefixColor: "text-gray-500 dark:text-gray-400",
      };
    }
    return { prefix: "", content: line, prefixColor: "" };
  };

  const getLineColor = (line: string): string => {
    if (line.startsWith("$")) {
      return "text-theme-secondary";
    }
    if (line.startsWith("Out[")) {
      return "text-theme-accent";
    }
    if (line.startsWith("IPython") || line.includes("Type")) {
      return "text-gray-600 dark:text-gray-300";
    }
    if (line.trim() === "") {
      return "text-gray-500 dark:text-gray-400";
    }
    return "text-gray-700 dark:text-gray-300";
  };

  /**
   * Highlight Python syntax in a line of code
   */
  const highlightPython = (text: string): JSX.Element[] => {
    if (!text.trim()) {
      return [<span key="empty">{text || "\u00A0"}</span>];
    }

    const keywords = [
      "def",
      "async",
      "await",
      "import",
      "from",
      "if",
      "elif",
      "else",
      "return",
      "for",
      "in",
      "as",
      "and",
      "or",
      "not",
      "True",
      "False",
      "None",
    ];

    // Find comment position (comments take priority)
    const commentMatch = text.match(/#.*$/);
    const commentIndex = commentMatch ? commentMatch.index! : text.length;
    const codeText = text.slice(0, commentIndex);
    const commentText = commentMatch ? commentMatch[0] : "";

    // Match strings (single and double quoted)
    const stringRegex = /(['"])(?:(?=(\\?))\2.)*?\1/g;
    let stringMatch;
    const stringMatches: Array<{ start: number; end: number; text: string }> = [];
    while ((stringMatch = stringRegex.exec(codeText)) !== null) {
      stringMatches.push({
        start: stringMatch.index,
        end: stringMatch.index + stringMatch[0].length,
        text: stringMatch[0],
      });
    }

    // Match numbers
    const numberRegex = /\b\d+\.?\d*\b/g;
    let numberMatch;
    const numberMatches: Array<{ start: number; end: number; text: string }> = [];
    while ((numberMatch = numberRegex.exec(codeText)) !== null) {
      numberMatches.push({
        start: numberMatch.index,
        end: numberMatch.index + numberMatch[0].length,
        text: numberMatch[0],
      });
    }

    // Match keywords
    const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    let keywordMatch;
    const keywordMatches: Array<{ start: number; end: number; text: string }> = [];
    while ((keywordMatch = keywordRegex.exec(codeText)) !== null) {
      keywordMatches.push({
        start: keywordMatch.index,
        end: keywordMatch.index + keywordMatch[0].length,
        text: keywordMatch[0],
      });
    }

    // Combine all matches and sort by position
    const allMatches = [
      ...stringMatches.map((m) => ({ ...m, type: "string" })),
      ...numberMatches.map((m) => ({ ...m, type: "number" })),
      ...keywordMatches.map((m) => ({ ...m, type: "keyword" })),
    ].sort((a, b) => a.start - b.start);

    // Remove overlapping matches (strings take priority, then numbers, then keywords)
    const filteredMatches: typeof allMatches = [];
    for (const match of allMatches) {
      const overlaps = filteredMatches.some(
        (existing) =>
          (match.start >= existing.start && match.start < existing.end) ||
          (match.end > existing.start && match.end <= existing.end) ||
          (match.start <= existing.start && match.end >= existing.end)
      );
      if (!overlaps) {
        filteredMatches.push(match);
      }
    }

    // Build parts array for the code part (before comment)
    const resultParts: Array<{ text: string; type: string }> = [];
    let currentIndex = 0;
    filteredMatches.forEach((match) => {
      if (match.start > currentIndex) {
        resultParts.push({
          text: codeText.slice(currentIndex, match.start),
          type: "text",
        });
      }
      resultParts.push({ text: match.text, type: match.type });
      currentIndex = match.end;
    });
    if (currentIndex < codeText.length) {
      resultParts.push({
        text: codeText.slice(currentIndex),
        type: "text",
      });
    }

    // If no matches were found, add the whole codeText as text
    if (resultParts.length === 0 && codeText.length > 0) {
      resultParts.push({ text: codeText, type: "text" });
    }

    // Add comment if it exists
    if (commentText) {
      resultParts.push({ text: commentText, type: "comment" });
    }

    if (resultParts.length === 0) {
      resultParts.push({ text, type: "text" });
    }

    return resultParts.map((part, index) => {
      const className =
        part.type === "keyword"
          ? "text-theme-primary"
          : part.type === "string"
            ? "text-theme-secondary"
            : part.type === "number"
              ? "text-theme-accent"
              : part.type === "comment"
                ? "text-gray-500 dark:text-gray-400 italic opacity-75"
                : "";
      return (
        <span key={index} className={className}>
          {part.text}
        </span>
      );
    });
  };

  // Calculate max height based on the longest example
  const maxLines = Math.max(...examples.map((ex) => ex.lines.length));
  const lineHeight = 1.25; // rem (20px for text-sm)
  const padding = 1 * 2; // rem (top + bottom padding)
  const controlsHeight = 2; // rem (window controls height)
  const minHeight = `${maxLines * lineHeight + padding + controlsHeight}rem`;

  return (
    <div>
      <div
        className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden font-mono text-sm"
        style={{ minHeight }}
      >
        {/* macOS Window Controls */}
        <div className="bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        {/* Terminal Content */}
        <div className="p-3 whitespace-pre">
          {displayedLines.map((line, index) => {
            const { prefix, content, prefixColor } = getLinePrefix(line);
            const lineColor = getLineColor(line);
            
            // Check if this line should have syntax highlighting (Python code)
            const isPythonCode =
              line.startsWith("In [") ||
              line.startsWith("   ...:") ||
              (line.startsWith("Out[") && content.trim().length > 0);

            return (
              <div key={index} className={`${lineColor} whitespace-pre`}>
                {prefix && <span className={prefixColor}>{prefix}</span>}
                {isPythonCode && content.trim()
                  ? highlightPython(content)
                  : content || "\u00A0"}
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
                ? "w-3 h-3 bg-theme-accent border-2 border-theme-primary scale-125"
                : "w-2 h-2 bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500"
            }`}
            aria-label={`Go to ${example.name}`}
            title={example.name}
          />
        ))}
      </div>
    </div>
  );
}
