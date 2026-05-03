import React, { useEffect, useState } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';

const Cursor = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    // Spring physics for smooth trailing
    const mouseX = useSpring(0, { stiffness: 500, damping: 28 });
    const mouseY = useSpring(0, { stiffness: 500, damping: 28 });

    useEffect(() => {
        const moveMouse = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleHover = (e) => {
            const target = e.target;
            const isClickable = target.closest('button, a, input, select, .cursor-pointer');
            setIsHovered(!!isClickable);
        };

        const handleClick = () => {
            setIsClicked(true);
            setTimeout(() => setIsClicked(false), 300);
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mouseover', handleHover);
        window.addEventListener('mousedown', handleClick);

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mouseover', handleHover);
            window.removeEventListener('mousedown', handleClick);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Inner Neural Dot */}
            <motion.div 
                className="fixed top-0 left-0 w-2 h-2 bg-[#00FFD1] rounded-full z-[10000]"
                style={{ 
                    x: mouseX, 
                    y: mouseY, 
                    marginLeft: '-4px', 
                    marginTop: '-4px',
                    boxShadow: '0 0 10px #00FFD1, 0 0 20px #00FFD1'
                }}
                animate={{
                    scale: isClicked ? 0.5 : isHovered ? 1.5 : 1,
                    backgroundColor: isHovered ? '#BF00FF' : '#00FFD1'
                }}
            />

            {/* Outer Quantum Aura */}
            <motion.div 
                className="fixed top-0 left-0 w-10 h-10 border border-[#00FFD1]/40 rounded-full z-[9999]"
                style={{ 
                    x: mouseX, 
                    y: mouseY, 
                    marginLeft: '-20px', 
                    marginTop: '-20px'
                }}
                animate={{
                    scale: isClicked ? 1.5 : isHovered ? 2 : 1,
                    borderColor: isHovered ? '#BF00FF' : 'rgba(0, 255, 209, 0.4)',
                    borderWidth: isHovered ? '2px' : '1px',
                    rotate: isHovered ? 90 : 0
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />

            {/* Click Ripple Effect */}
            <AnimatePresence>
                {isClicked && (
                    <motion.div 
                        initial={{ opacity: 0.5, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 3 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-0 left-0 w-10 h-10 border-2 border-[#00FFD1] rounded-full z-[9998]"
                        style={{ 
                            left: mouseX.get(), 
                            top: mouseY.get(), 
                            marginLeft: '-20px', 
                            marginTop: '-20px' 
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Cursor;
