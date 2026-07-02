"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveal — quiet scroll-entry motion for major content blocks.
 *
 * Elements begin at opacity 0 / translateY(12px) and resolve over 600ms on a
 * cubic-bezier(0.16, 1, 0.3, 1) easing when they enter the viewport. Uses
 * IntersectionObserver (never a scroll listener) and animates only `transform`
 * and `opacity`. Honours `prefers-reduced-motion` and any environment without
 * IntersectionObserver by showing content immediately — content is never left
 * hidden.
 *
 * For staggered lists, pass an increasing `delay` (e.g. index * 80).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: shown ? `${delay}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-[opacity,transform] duration-[600ms] motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
