"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
type Particle = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
};
export default function Particles({
  className = "",
  quantity = 30,
  staticity = 50,
  ease = 50,
  refresh = false,
}: {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    let width = 0,
      height = 0,
      frame = 0;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0 };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = width * ratio;
      element.height = height * ratio;
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from(
        { length: Math.min(300, Math.max(0, quantity)) },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.3,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          alpha: Math.random() * 0.5 + 0.1,
        }),
      );
    };
    const move = (event: PointerEvent) => {
      mouse.x = (event.clientX - width / 2) / Math.max(1, staticity);
      mouse.y = (event.clientY - height / 2) / Math.max(1, staticity);
    };
    const draw = () => {
      if (!document.hidden) {
        context.clearRect(0, 0, width, height);
        particles.forEach((particle) => {
          if (!reduceMotion) {
            particle.x = (particle.x + particle.vx + width) % width;
            particle.y = (particle.y + particle.vy + height) % height;
          }
          context.beginPath();
          context.arc(
            particle.x + mouse.x / Math.max(1, ease / 10),
            particle.y + mouse.y / Math.max(1, ease / 10),
            particle.radius,
            0,
            Math.PI * 2,
          );
          context.fillStyle = `rgba(160,175,210,${particle.alpha})`;
          context.fill();
        });
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    if (!reduceMotion)
      window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, [quantity, staticity, ease, refresh, reduceMotion]);
  return (
    <div className={cn("pointer-events-none", className)} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
