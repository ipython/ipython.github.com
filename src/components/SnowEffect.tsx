import { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  sway: number;
  swaySpeed: number;
  rotation: number;
  rotationSpeed: number;
  sparkleTimer: number;
  stuck?: boolean;
  stuckElement?: HTMLElement;
  stuckX?: number; // Relative to element
  stuckY?: number; // Relative to element top
}

interface Accumulation {
  element: HTMLElement;
  stuckFlakes: Snowflake[];
  maxAmount: number;
}

export default function SnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const snowflakesRef = useRef<Snowflake[]>([]);
  const windRef = useRef(0);
  const accumulationsRef = useRef<Map<HTMLElement, Accumulation>>(new Map());
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create snowflakes function
    const createSnowflake = (canvas: HTMLCanvasElement): Snowflake => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height, // Start above viewport
      size: Math.random() * 4 + 1.5,
      speed: Math.random() * 2.5 + 0.8,
      opacity: Math.random() * 0.6 + 0.4,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.03 + 0.015,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      sparkleTimer: Math.random() * 100,
    });

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Only recreate non-stuck snowflakes on resize
      const activeCount = snowflakesRef.current.filter(f => !f.stuck).length;
      const targetCount = Math.floor((canvas.width * canvas.height) / 12000);
      if (activeCount < targetCount) {
        const needed = targetCount - activeCount;
        for (let i = 0; i < needed; i++) {
          snowflakesRef.current.push(createSnowflake(canvas));
        }
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize snowflakes
    const snowflakeCount = Math.floor((canvas.width * canvas.height) / 12000);
    snowflakesRef.current = Array.from({ length: snowflakeCount }, () => createSnowflake(canvas));

    // Find elements that can accumulate snow
    const findAccumulationTargets = (): HTMLElement[] => {
      const targets: HTMLElement[] = [];
      
      // Find buttons (a tags with button-like styling, button elements)
      document.querySelectorAll('a[class*="px-"], button, a[class*="py-"]').forEach((el) => {
        if (el instanceof HTMLElement) {
          const rect = el.getBoundingClientRect();
          // Only include visible elements with reasonable size
          if (rect.width > 50 && rect.height > 20 && rect.top < window.innerHeight && rect.bottom > 0) {
            targets.push(el);
          }
        }
      });
      
      // Find terminals and code blocks (pre elements, AnimatedTerminal containers)
      // AnimatedTerminal has: bg-gray-50 dark:bg-gray-900 rounded-lg font-mono
      // Also look for divs containing the macOS window controls (red/yellow/green circles)
      document.querySelectorAll('pre, code, div[class*="bg-gray-50"][class*="rounded-lg"], div[class*="bg-gray-900"][class*="rounded-lg"]').forEach((el) => {
        if (el instanceof HTMLElement) {
          const rect = el.getBoundingClientRect();
          // Check if it looks like a terminal/code block (has reasonable size and font-mono or contains window controls)
          const hasWindowControls = el.querySelector('div[class*="bg-red-500"], div[class*="bg-yellow-500"], div[class*="bg-green-500"]');
          const hasFontMono = el.classList.contains('font-mono') || window.getComputedStyle(el).fontFamily.includes('mono');
          if (rect.width > 100 && rect.height > 50 && rect.top < window.innerHeight && rect.bottom > 0 && (hasWindowControls || hasFontMono)) {
            targets.push(el);
          }
        }
      });
      
      // Find card-like containers (divs with rounded corners and padding)
      document.querySelectorAll('div[class*="rounded-lg"], div[class*="rounded-xl"], div[class*="rounded-md"]').forEach((el) => {
        if (el instanceof HTMLElement) {
          const rect = el.getBoundingClientRect();
          // Only include substantial containers, not tiny icons
          if (rect.width > 150 && rect.height > 80 && rect.top < window.innerHeight && rect.bottom > 0) {
            // Check if it's not already added
            if (!targets.includes(el)) {
              targets.push(el);
            }
          }
        }
      });
      
      return targets;
    };

    // Initialize accumulations
    const updateAccumulationTargets = () => {
      const targets = findAccumulationTargets();
      const currentMap = accumulationsRef.current;
      
      // Remove elements that are no longer in the DOM
      currentMap.forEach((acc, element) => {
        if (!document.contains(element)) {
          // Unstick all flakes from this element
          acc.stuckFlakes.forEach((flake) => {
            flake.stuck = false;
            flake.stuckElement = undefined;
            // Add back to active flakes if they're still valid
            if (flake.y < canvas.height + 100) {
              snowflakesRef.current.push(flake);
            }
          });
          currentMap.delete(element);
          // Remove accumulation style
          element.style.position = '';
          element.style.overflow = '';
          const container = element.querySelector('.snow-accumulation-container');
          if (container) container.remove();
        }
      });
      
      // Add new elements
      targets.forEach((element) => {
        if (!currentMap.has(element)) {
          currentMap.set(element, {
            element,
            stuckFlakes: [],
            maxAmount: Math.min(element.offsetHeight * 0.3, 30), // Max 30% of height or 30px
          });
          
          // Set up element for accumulation overlay
          const computedStyle = window.getComputedStyle(element);
          if (computedStyle.position === 'static') {
            element.style.position = 'relative';
          }
          element.style.overflow = 'visible'; // Changed to visible so flakes can be seen
        }
      });
    };

    // Check if snowflake is over an element
    const isOverElement = (x: number, y: number, element: HTMLElement): boolean => {
      const rect = element.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    // Render stuck snowflakes on elements
    const renderStuckFlakes = (acc: Accumulation) => {
      const container = acc.element.querySelector('.snow-accumulation-container') as HTMLElement;
      
      if (acc.stuckFlakes.length === 0) {
        if (container) container.remove();
        return;
      }

      let flakesContainer = container;
      if (!flakesContainer) {
        flakesContainer = document.createElement('div');
        flakesContainer.className = 'snow-accumulation-container';
        flakesContainer.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          pointer-events: none;
          z-index: 1000;
        `;
        acc.element.appendChild(flakesContainer);
      }

      // Clear and re-render all stuck flakes
      flakesContainer.innerHTML = '';
      
      acc.stuckFlakes.forEach((flake) => {
        if (flake.stuckX === undefined || flake.stuckY === undefined) return;
        
        const flakeDiv = document.createElement('div');
        flakeDiv.style.cssText = `
          position: absolute;
          left: ${flake.stuckX}px;
          top: ${flake.stuckY}px;
          width: ${flake.size * 2}px;
          height: ${flake.size * 2}px;
          opacity: ${flake.opacity};
          pointer-events: none;
          transform: translate(-50%, 0);
        `;
        
        // Create SVG snowflake
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', `${flake.size * 2}`);
        svg.setAttribute('height', `${flake.size * 2}`);
        svg.setAttribute('viewBox', `0 0 ${flake.size * 2} ${flake.size * 2}`);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', `${flake.size}`);
        circle.setAttribute('cy', `${flake.size}`);
        circle.setAttribute('r', `${flake.size}`);
        circle.setAttribute('fill', 'white');
        svg.appendChild(circle);
        
        // Add star shape for larger flakes
        if (flake.size > 2) {
          for (let i = 0; i < 6; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', `${flake.size}`);
            line.setAttribute('y1', `${flake.size}`);
            line.setAttribute('x2', `${flake.size}`);
            line.setAttribute('y2', '0');
            line.setAttribute('stroke', 'white');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('transform', `rotate(${i * 60} ${flake.size} ${flake.size})`);
            svg.appendChild(line);
          }
        }
        
        flakeDiv.appendChild(svg);
        flakesContainer.appendChild(flakeDiv);
      });
    };

    updateAccumulationTargets();
    // Update targets periodically (in case new elements are added)
    const targetsInterval = setInterval(updateAccumulationTargets, 2000);

    // Draw a more detailed snowflake
    const drawSnowflake = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Main circle
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();

      // Add sparkle effect
      if (Math.random() > 0.95) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(173, 216, 230, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw 6-pointed star shape for larger flakes
      if (size > 2) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, size * 1.5);
          ctx.stroke();
          ctx.rotate(Math.PI / 3);
        }
      }

      ctx.restore();
    };

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

    // Animation loop
    const animate = () => {
      // Pause animation when page is not visible
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gentle wind effect
      windRef.current += (Math.random() - 0.5) * 0.1;
      windRef.current = Math.max(-1, Math.min(1, windRef.current));

      // Update falling snowflakes and check for collisions
      const activeFlakes: Snowflake[] = [];
      
      snowflakesRef.current.forEach((flake) => {
        // Skip if already stuck
        if (flake.stuck) {
          return;
        }

        // Update position
        const prevY = flake.y;
        flake.y += flake.speed;
        flake.sway += flake.swaySpeed;
        flake.rotation += flake.rotationSpeed;
        flake.sparkleTimer += 0.1;
        
        // Wind effect
        flake.x += Math.sin(flake.sway) * 0.8 + windRef.current * 0.3;

        // Check collision with accumulation targets
        let stuck = false;
        accumulationsRef.current.forEach((acc) => {
          if (stuck) return;
          
          const rect = acc.element.getBoundingClientRect();
          
          // Only check if element is visible and in viewport
          if (rect.width === 0 || rect.height === 0) return;
          if (rect.bottom < 0 || rect.top > window.innerHeight) return; // Element not in viewport
          
          // Check if snowflake is hitting the top of the element
          // Canvas coordinates are viewport-relative (fixed position)
          // getBoundingClientRect() also returns viewport-relative coordinates
          const elementTop = rect.top;
          const elementLeft = rect.left;
          
          // Check collision: flake must be horizontally over the element
          // and vertically crossing from above to at/below the top
          const horizontalOverlap = flake.x >= elementLeft - flake.size && flake.x <= elementLeft + rect.width + flake.size;
          // Check if flake is crossing the top edge of the element
          const verticalCrossing = prevY < elementTop && flake.y >= elementTop - 3; // Allow small overlap
          const withinMaxHeight = flake.y <= elementTop + acc.maxAmount;
          
          if (horizontalOverlap && verticalCrossing && withinMaxHeight) {
            // Stick the flake
            flake.stuck = true;
            flake.stuckElement = acc.element;
            // Position relative to element's left edge and top
            flake.stuckX = flake.x - elementLeft;
            // Stack flakes - place new flake on top of existing ones, starting at the very top
            const existingHeight = acc.stuckFlakes.reduce((max, f) => {
              const fY = (f.stuckY ?? 0) + (f.size * 2);
              return Math.max(max, fY);
            }, 0);
            // Start stacking from the very top (0), but allow stacking up to maxAmount
            // First flake goes at top (0), subsequent ones stack on top
            flake.stuckY = Math.min(existingHeight, acc.maxAmount - flake.size * 2);
            
            // Add to accumulation
            acc.stuckFlakes.push(flake);
            
            // Limit accumulation height - remove oldest flakes
            if (acc.stuckFlakes.length > 50) {
              const removed = acc.stuckFlakes.shift();
              if (removed) {
                removed.stuck = false;
                removed.stuckElement = undefined;
                removed.stuckX = undefined;
                removed.stuckY = undefined;
              }
            }
            
            stuck = true;
          }
        });

        if (!stuck) {
          // Reset if off screen
          if (flake.y > canvas.height + 10) {
            flake.y = -10;
            flake.x = Math.random() * canvas.width;
            flake.sway = Math.random() * Math.PI * 2;
          }

          // Wrap around horizontally
          if (flake.x < -10) flake.x = canvas.width + 10;
          if (flake.x > canvas.width + 10) flake.x = -10;

          activeFlakes.push(flake);

          // Pulsing opacity for sparkle effect
          const sparkleOpacity = flake.opacity + Math.sin(flake.sparkleTimer) * 0.2;

          // Draw snowflake
          drawSnowflake(ctx, flake.x, flake.y, flake.size, flake.rotation, Math.max(0.3, Math.min(1, sparkleOpacity)));
        }
      });

      // Update active flakes list (remove stuck ones)
      snowflakesRef.current = activeFlakes;
      
      // Spawn new flakes to maintain target count
      const targetCount = Math.floor((canvas.width * canvas.height) / 12000);
      const currentActiveCount = activeFlakes.length;
      if (currentActiveCount < targetCount) {
        const needed = targetCount - currentActiveCount;
        for (let i = 0; i < needed; i++) {
          activeFlakes.push(createSnowflake(canvas));
        }
        snowflakesRef.current = activeFlakes;
      }

      // Render stuck flakes on elements
      accumulationsRef.current.forEach((acc) => {
        // Gradually remove some stuck flakes (melting effect)
        if (Math.random() > 0.995 && acc.stuckFlakes.length > 0) {
          const removed = acc.stuckFlakes.shift();
          if (removed) {
            removed.stuck = false;
            removed.stuckElement = undefined;
          }
        }
        
        renderStuckFlakes(acc);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(targetsInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up accumulation overlays
      accumulationsRef.current.forEach((acc) => {
        const container = acc.element.querySelector('.snow-accumulation-container');
        if (container) container.remove();
        acc.element.style.position = '';
        acc.element.style.overflow = '';
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
