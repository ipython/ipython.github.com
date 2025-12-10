import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
}

export default function OceanWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const bubblesRef = useRef<Bubble[]>([]);
  const waveOffsetRef = useRef(0);
  const sectionDividersRef = useRef<Array<{ y: number; inverted: boolean }>>([]);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const findSections = () => {
      const sections = document.querySelectorAll('section, main > div');
      sectionDividersRef.current = [];
      
      sections.forEach((section, index) => {
        if (index === 0) return; // Skip first section
        const rect = section.getBoundingClientRect();
        const scrollY = window.scrollY;
        const sectionTop = rect.top + scrollY;
        
        // Check if section has different background
        const computedStyle = window.getComputedStyle(section);
        const bgColor = computedStyle.backgroundColor;
        const prevSection = sections[index - 1] as HTMLElement;
        const prevBgColor = prevSection ? window.getComputedStyle(prevSection).backgroundColor : '';
        
        // Add divider if sections have different backgrounds or are substantial
        if (bgColor !== prevBgColor || rect.height > 200) {
          sectionDividersRef.current.push({
            y: sectionTop,
            inverted: index % 2 === 0, // Alternate wave direction
          });
        }
      });
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Create bubbles (distribute across viewport)
      bubblesRef.current = [];
      const bubbleCount = Math.floor((canvas.width * canvas.height) / 20000);
      for (let i = 0; i < bubbleCount; i++) {
        bubblesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 2 + Math.random() * 8,
          speed: 0.5 + Math.random() * 1.5,
          opacity: 0.2 + Math.random() * 0.4,
          drift: (Math.random() - 0.5) * 0.5,
        });
      }
      
      findSections();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', findSections, { passive: true });
    
    // Update sections periodically
    const sectionInterval = setInterval(findSections, 1000);

    const drawWave = (ctx: CanvasRenderingContext2D, screenY: number, amplitude: number, frequency: number, speed: number, color: string, opacity: number, inverted: boolean = false) => {
      ctx.save();
      ctx.beginPath();
      
      const direction = inverted ? -1 : 1;
      const waveSpeed = speed * direction;
      
      // Reduced gradient height - only 80px above/below the wave
      const gradientHeight = 80;
      const gradientStart = inverted ? screenY + amplitude : screenY - amplitude;
      const gradientEnd = inverted ? screenY + amplitude - gradientHeight : screenY - amplitude + gradientHeight;
      
      ctx.moveTo(0, screenY);
      
      for (let x = 0; x <= canvas.width; x += 2) {
        const waveY = screenY + Math.sin((x * frequency + waveOffsetRef.current * waveSpeed) * 0.01) * amplitude * direction;
        ctx.lineTo(x, waveY);
      }
      
      if (inverted) {
        // Wave going up - fill above (limited height)
        ctx.lineTo(canvas.width, gradientEnd);
        ctx.lineTo(0, gradientEnd);
      } else {
        // Wave going down - fill below (limited height)
        ctx.lineTo(canvas.width, gradientEnd);
        ctx.lineTo(0, gradientEnd);
      }
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, gradientStart, 0, gradientEnd);
      gradient.addColorStop(0, color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, color + '00');
      
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    };

    const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble) => {
      ctx.save();
      ctx.globalAlpha = bubble.opacity;
      
      const scrollY = window.scrollY;
      const screenX = bubble.x;
      const screenY = bubble.y - scrollY;
      
      // Draw bubble
      const gradient = ctx.createRadialGradient(
        screenX - bubble.size * 0.3,
        screenY - bubble.size * 0.3,
        0,
        screenX,
        screenY,
        bubble.size
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.7, 'rgba(0, 212, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, bubble.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(screenX - bubble.size * 0.3, screenY - bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
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

    const animate = () => {
      // Pause animation when page is not visible
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update wave offset
      waveOffsetRef.current += 1;
      
      const scrollY = window.scrollY;
      
      // Draw waves at section dividers
      sectionDividersRef.current.forEach((divider) => {
        const dividerScreenY = divider.y - scrollY;
        
        // Only draw if in or near viewport (reduced range to match smaller gradient)
        if (dividerScreenY > -100 && dividerScreenY < window.innerHeight + 100) {
          if (divider.inverted) {
            // Wave going up - more vibrant colors
            drawWave(ctx, dividerScreenY, 18, 0.5, 1.5, '#00EFFF', 0.25, true);
            drawWave(ctx, dividerScreenY - 15, 15, 0.6, 1.2, '#00C8FF', 0.2, true);
            drawWave(ctx, dividerScreenY - 30, 12, 0.7, 1, '#00A8FF', 0.15, true);
          } else {
            // Wave going down - more vibrant colors
            drawWave(ctx, dividerScreenY, 18, 0.5, 1.5, '#00EFFF', 0.25, false);
            drawWave(ctx, dividerScreenY + 15, 15, 0.6, 1.2, '#00C8FF', 0.2, false);
            drawWave(ctx, dividerScreenY + 30, 12, 0.7, 1, '#00A8FF', 0.15, false);
          }
        }
      });
      
      // Draw waves at the bottom of document (footer)
      const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      const bottomWaveDocY = docHeight - 100;
      const bottomWaveScreenY = bottomWaveDocY - scrollY;
      
      // Only draw if in or near viewport (reduced range)
      if (bottomWaveScreenY > -100 && bottomWaveScreenY < window.innerHeight + 100) {
        drawWave(ctx, bottomWaveScreenY, 20, 0.5, 2, '#00EFFF', 0.28);
        drawWave(ctx, bottomWaveScreenY + 20, 16, 0.6, 1.5, '#00C8FF', 0.22);
        drawWave(ctx, bottomWaveScreenY + 40, 14, 0.7, 1, '#00A8FF', 0.18);
      }
      
      // Update and draw bubbles (viewport-relative)
      bubblesRef.current.forEach((bubble) => {
        // Update bubble position (viewport coordinates)
        bubble.y -= bubble.speed;
        bubble.x += bubble.drift;
        
        // Reset if off screen
        if (bubble.y < -bubble.size) {
          bubble.y = window.innerHeight + bubble.size;
          bubble.x = Math.random() * canvas.width;
        }
        if (bubble.y > window.innerHeight + bubble.size) {
          bubble.y = -bubble.size;
          bubble.x = Math.random() * canvas.width;
        }
        
        // Wrap horizontally
        if (bubble.x < -bubble.size) bubble.x = canvas.width + bubble.size;
        if (bubble.x > canvas.width + bubble.size) bubble.x = -bubble.size;
        
        // Draw bubble (already in viewport coordinates)
        drawBubble(ctx, bubble);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', findSections);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(sectionInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full pointer-events-none z-0"
      style={{ height: '100vh' }}
    />
  );
}
