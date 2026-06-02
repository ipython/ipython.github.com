import React, { useEffect, useRef } from 'react';
import '../styles/christmas-trees.css';

export default function ChristmasTree() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create SVG tree element
    const createTreeSVG = (scale: number = 1) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 140');
      svg.setAttribute('width', `${80 * scale}`);
      svg.setAttribute('height', `${112 * scale}`);
      svg.className = 'dancing-tree';

      // Tree foliage layers
      const foliage1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      foliage1.setAttribute('points', '50,10 20,60 80,60');
      foliage1.setAttribute('fill', '#1b4d2e');
      svg.appendChild(foliage1);

      const foliage2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      foliage2.setAttribute('points', '50,40 10,90 90,90');
      foliage2.setAttribute('fill', '#0d3c1f');
      svg.appendChild(foliage2);

      const foliage3 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      foliage3.setAttribute('points', '50,70 15,120 85,120');
      foliage3.setAttribute('fill', '#1b4d2e');
      svg.appendChild(foliage3);

      // Tree trunk
      const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      trunk.setAttribute('x', '40');
      trunk.setAttribute('y', '110');
      trunk.setAttribute('width', '20');
      trunk.setAttribute('height', '30');
      trunk.setAttribute('fill', '#8B4513');
      svg.appendChild(trunk);

      // Star on top
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      star.setAttribute('points', '50,0 55,15 70,15 58,25 63,40 50,30 37,40 42,25 30,15 45,15');
      star.setAttribute('fill', '#ffd700');
      star.className = 'tree-star';
      svg.appendChild(star);

      // Ornaments
      const ornaments = [
        { cx: 35, cy: 40, color: '#c8102e' },
        { cx: 65, cy: 45, color: '#ffd700' },
        { cx: 50, cy: 50, color: '#ffd700' },
        { cx: 25, cy: 75, color: '#c8102e' },
        { cx: 50, cy: 85, color: '#ffd700' },
        { cx: 75, cy: 80, color: '#c8102e' },
        { cx: 35, cy: 105, color: '#ffd700' },
        { cx: 65, cy: 110, color: '#c8102e' },
      ];

      ornaments.forEach((ornament) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', ornament.cx.toString());
        circle.setAttribute('cy', ornament.cy.toString());
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', ornament.color);
        circle.className = 'ornament-light';
        svg.appendChild(circle);
      });

      return svg;
    };

    // Create tree with wrapper
    const createTree = (x: number, y: number, scale: number, opacity: number, delay: number) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'tree-wrapper';
      wrapper.style.position = 'absolute';
      wrapper.style.left = `${x}px`;
      wrapper.style.top = `${y}px`;
      wrapper.style.opacity = `${opacity}`;
      wrapper.style.transformOrigin = 'center bottom';
      wrapper.style.setProperty('--animation-delay', `${delay}s`);
      wrapper.appendChild(createTreeSVG(scale));
      return wrapper;
    };

    const viewportHeight = window.innerHeight || 800;
    const treePositions = [
      { x: 10, y: viewportHeight * 0.35, scale: 1.4, opacity: 1, delay: 0 },
      { x: window.innerWidth - 130, y: viewportHeight * 0.25, scale: 1.5, opacity: 1, delay: 0.1 },
      { x: 80, y: viewportHeight * 0.5, scale: 1.1, opacity: 0.85, delay: 0.2 },
      { x: window.innerWidth - 240, y: viewportHeight * 0.55, scale: 1.2, opacity: 0.85, delay: 0.15 },
      { x: window.innerWidth / 2 - 80, y: viewportHeight * 0.45, scale: 1.3, opacity: 0.9, delay: 0.25 },
      { x: 120, y: viewportHeight * 0.15, scale: 0.9, opacity: 0.6, delay: 0.3 },
      { x: window.innerWidth - 200, y: viewportHeight * 0.05, scale: 0.95, opacity: 0.65, delay: 0.35 },
      { x: window.innerWidth / 2 - 150, y: viewportHeight * 0.12, scale: 0.85, opacity: 0.55, delay: 0.4 },
      { x: window.innerWidth / 2 + 100, y: viewportHeight * 0.2, scale: 0.9, opacity: 0.6, delay: 0.45 },
      { x: 200, y: viewportHeight * 0.4, scale: 1.0, opacity: 0.75, delay: 0.05 },
      { x: window.innerWidth - 350, y: viewportHeight * 0.42, scale: 1.0, opacity: 0.75, delay: 0.22 },
    ];

    treePositions.forEach((pos) => {
      container.appendChild(createTree(pos.x, pos.y, pos.scale, pos.opacity, pos.delay));
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
