import { useEffect, useRef } from 'react';

interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleTimer: number;
  twinkleSpeed: number;
  color: string;
}

export default function ChristmasSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const sparklesRef = useRef<Sparkle[]>([]);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#c8102e', '#006b3c', '#ffffff', '#ffd700'];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create sparkles scattered across the viewport
    const createSparkles = () => {
      sparklesRef.current = [];
      const sparkleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < sparkleCount; i++) {
        sparklesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 3 + Math.random() * 4,
          opacity: 0.3 + Math.random() * 0.7,
          twinkleTimer: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.03,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };
    
    createSparkles();
    
    const cleanup = () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const drawSparkle = (ctx: CanvasRenderingContext2D, sparkle: Sparkle) => {
      ctx.save();
      
      // Update twinkle
      sparkle.twinkleTimer += sparkle.twinkleSpeed;
      const twinkle = Math.sin(sparkle.twinkleTimer) * 0.5 + 0.5;
      const currentOpacity = sparkle.opacity * twinkle;

      // Draw sparkle as a star
      ctx.translate(sparkle.x, sparkle.y);
      ctx.globalAlpha = currentOpacity;
      ctx.strokeStyle = sparkle.color;
      ctx.fillStyle = sparkle.color;
      ctx.lineWidth = 1.5;

      // Draw 4-pointed star
      const size = sparkle.size;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const x1 = Math.cos(angle) * size;
        const y1 = Math.sin(angle) * size;
        const x2 = Math.cos(angle + Math.PI / 4) * size * 0.5;
        const y2 = Math.sin(angle + Math.PI / 4) * size * 0.5;
        
        if (i === 0) {
          ctx.moveTo(x1, y1);
        } else {
          ctx.lineTo(x1, y1);
        }
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw center dot
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
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

      sparklesRef.current.forEach((sparkle) => {
        drawSparkle(ctx, sparkle);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}
