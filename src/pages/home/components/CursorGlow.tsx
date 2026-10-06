import { useEffect, useState } from 'react';

export function CursorGlow() {
  const [position, setPosition] = useState({ x: -400, y: -400 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-30 w-96 h-96 rounded-full opacity-30 mix-blend-screen"
      style={{
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(59, 130, 246, 0.25) 50%, transparent 70%)',
        filter: 'blur(40px)',
        transform: `translate(${position.x - 192}px, ${position.y - 192}px)`,
      }}
    />
  );
}
