import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export default function Cursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleHover = () => setIsHovered(true);
    const handleUnhover = () => setIsHovered(false);
    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    
    const targets = document.querySelectorAll('button, a, input, select, textarea, .interactive');
    targets.forEach(t => {
      t.addEventListener('mouseenter', handleHover);
      t.addEventListener('mouseleave', handleUnhover);
    });

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      targets.forEach(t => {
        t.removeEventListener('mouseenter', handleHover);
        t.removeEventListener('mouseleave', handleUnhover);
      });
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* The Classic Sharp Pointer */}
      <motion.div
        style={{
          translateX: cursorX,
          translateY: cursorY,
          left: -4,
          top: -4,
        }}
        animate={{
          scale: isClicking ? 0.8 : 1,
          rotate: isHovered ? 45 : 0,
        }}
        className="fixed pointer-events-none z-[10000] hidden md:block"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_10px_var(--dim-glow)]"
        >
          <path 
            d="M5.5 3.5L18.5 12L5.5 20.5V3.5Z" 
            fill="white" 
            stroke="var(--dim-primary)" 
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <motion.path 
            animate={{ opacity: isHovered ? 1 : 0 }}
            d="M5.5 3.5L18.5 12L5.5 20.5V3.5Z" 
            fill="var(--dim-accent)" 
            className="mix-blend-overlay"
          />
        </svg>
      </motion.div>

      {/* The Trailing Aura */}
      <motion.div
        style={{
          translateX: cursorX,
          translateY: cursorY,
          left: -20,
          top: -20,
        }}
        animate={{
          scale: isHovered ? 1.5 : 0.5,
          opacity: isHovered ? 0.4 : 0.1,
          borderColor: isHovered ? 'var(--dim-accent)' : 'var(--dim-primary)',
        }}
        transition={{ duration: 0.3 }}
        className="fixed w-10 h-10 border border-white/30 rounded-full pointer-events-none z-[9999] hidden md:block blur-[1px]"
      />

      {/* Sparkle Trail (CSS only for performance) */}
      <style>{`
        body {
          cursor: none !important;
        }
        button, a, input, select, textarea {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
