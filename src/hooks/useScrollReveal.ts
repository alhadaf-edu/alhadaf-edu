'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollRevealOptions {
  /** 0–1: fraction of element visible before triggering (default 0.15) */
  threshold?: number;
  /** Extra root margin, e.g. '-50px 0px' (default '0px') */
  rootMargin?: string;
  /** Trigger once and stay visible, or reset on scroll-out (default true) */
  triggerOnce?: boolean;
}

/**
 * useScrollReveal — IntersectionObserver hook for scroll-based animations.
 *
 * Usage:
 *   const { ref, isVisible } = useScrollReveal();
 *   <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): { ref: RefObject<T>; isVisible: boolean } {
  const { threshold = 0.15, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * useStaggerReveal — returns isVisible + per-child stagger delay class.
 * Use on the container; pass index for each child.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): { ref: RefObject<T>; isVisible: boolean; delayClass: (index: number) => string } {
  const { ref, isVisible } = useScrollReveal<T>(options);

  const delayClass = (index: number): string => {
    const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6'];
    return delays[index % delays.length];
  };

  return { ref, isVisible, delayClass };
}
