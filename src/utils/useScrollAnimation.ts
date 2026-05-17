import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * Optimized for performance and mobile devices
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
  } = options;

  const ref = useRef<HTMLElement>(null);
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
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Hook for staggered animations on multiple elements
 */
export function useStaggerAnimation(count: number, options: UseScrollAnimationOptions = {}) {
  const { ref, isVisible } = useScrollAnimation(options);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false));

  useEffect(() => {
    if (isVisible) {
      // Stagger the appearance of items
      visibleItems.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
          });
        }, index * 100); // 100ms delay between each item
      });
    }
  }, [isVisible]);

  return { ref, visibleItems };
}
