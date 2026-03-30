import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function Cursor() {
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 10);
      cursorY.set(e.clientY - 10);
    };
    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    const handleMouseLeave = () => setHidden(true);
    const handleMouseEnter = () => setHidden(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  if (hidden) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-5 h-5 bg-[#00f0ff] rounded-full mix-blend-screen pointer-events-none z-[999] shadow-[0_0_20px_rgba(0,240,255,0.8)]"
        style={{ x: cursorX, y: cursorY }}
        animate={{ scale: clicked ? 0.5 : 1 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-[#00f0ff]/40 rounded-full pointer-events-none z-[998] shadow-[0_0_30px_rgba(0,240,255,0.2)]"
        style={{ x: smoothX, y: smoothY, marginLeft: -14, marginTop: -14 }}
        animate={{ scale: clicked ? 1.5 : 1, opacity: clicked ? 0 : 1 }}
      />
    </>
  );
}
