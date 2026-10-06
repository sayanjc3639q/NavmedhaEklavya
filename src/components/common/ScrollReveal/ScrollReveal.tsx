"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: "fade" | "slide-left" | "slide-right" | "scale";
  delay?: 0 | 1 | 2 | 3;
  className?: string;
}

export function ScrollReveal({
  children,
  variant = "fade",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentElem = domRef.current;
    if (!currentElem) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(currentElem);

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  const variantClass = 
    variant === "slide-left" 
      ? "reveal-slide-left" 
      : variant === "slide-right" 
      ? "reveal-slide-right" 
      : variant === "scale" 
      ? "reveal-scale" 
      : "reveal";

  const delayClass = delay > 0 ? `reveal-delay-${delay}` : "";

  return (
    <div
      ref={domRef}
      className={`${variantClass} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
}
