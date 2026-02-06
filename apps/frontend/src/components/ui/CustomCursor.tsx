import { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        const trailer = trailerRef.current;

        if (!cursor || !trailer) return;

        const moveCursor = (e: MouseEvent) => {
            const { clientX, clientY } = e;

            // Main cursor moves instantly
            cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;

            // Trailer follows with a slight delay using simple interpolation
            // We'll use requestAnimationFrame for smoother animation in a separate loop
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('.service-card') ||
                target.closest('button') ||
                target.closest('a')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        // Animation loop for the trailer to follow smoothly
        let animationFrameId: number;
        let trailerX = 0;
        let trailerY = 0;

        const animateTrailer = () => {
            const cursorRect = cursor.getBoundingClientRect();
            // Target position is cursor position
            const targetX = cursorRect.left;
            const targetY = cursorRect.top;

            // Smooth interpolation (lerp)
            trailerX += (targetX - trailerX) * 0.15;
            trailerY += (targetY - trailerY) * 0.15;

            trailer.style.transform = `translate3d(${trailerX}px, ${trailerY}px, 0)`;

            animationFrameId = requestAnimationFrame(animateTrailer);
        };

        animateTrailer();

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            <div ref={cursorRef} className={`custom-cursor ${isHovering ? 'hover' : ''}`} />
            <div ref={trailerRef} className={`cursor-trailer ${isHovering ? 'hover' : ''}`} />
        </>
    );
};

export default CustomCursor;
