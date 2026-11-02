"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "framer-motion";
export default function ElasticCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion || !matchMedia("(pointer: fine)").matches)
      return;
    const x = gsap.quickTo(element, "x", {
      duration: 0.45,
      ease: "power3.out",
    });
    const y = gsap.quickTo(element, "y", {
      duration: 0.45,
      ease: "power3.out",
    });
    const move = (event: PointerEvent) => {
      element.style.opacity = "0.55";
      x(event.clientX);
      y(event.clientY);
    };
    const leave = () => {
      element.style.opacity = "0";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      x.tween.kill();
      y.tween.kill();
    };
  }, [reduceMotion]);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 h-9 w-9 -ml-[18px] -mt-[18px] rounded-full border border-foreground opacity-0 z-[1999] hidden md:block"
    />
  );
}
