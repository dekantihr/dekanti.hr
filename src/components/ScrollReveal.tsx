import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'blur' | 'rotate';
  delay?: number;
  threshold?: number;
  className?: string;
  triggerOnce?: boolean;
}

/**
 * ScrollReveal component - Reveals children with animation when scrolled into view
 * Uses Intersection Observer for performance
 * Respects prefers-reduced-motion
 */
export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
  className = '',
  triggerOnce = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, triggerOnce]);

  const animationClass = `scroll-${animation}`;
  const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref}
      className={`${animationClass} ${isVisible ? 'scroll-visible' : ''} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
}
