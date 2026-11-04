"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { config } from "@/data/config";
import styles from "./loader.module.css";

export default function Loader({
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const percentage = useRef<HTMLSpanElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const skipped = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let cancelled = false;
    let frame = 0;
    let context: gsap.Context | undefined;

    const start = () => {
      if (cancelled || skipped.current) return;
      // Text, progress and percentage all begin on this same hydrated frame.
      frame = requestAnimationFrame(() => {
        if (cancelled || skipped.current) return;
        context = gsap.context(() => {
          const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          const duration = reduced ? 0.25 : 2.5;
          const counter = { value: 0 };
          let lastPercentage = -1;
          const sequence = gsap.timeline({ onComplete });
          timeline.current = sequence;
          sequence.to(
            counter,
            {
              value: 100,
              duration,
              ease: "none",
              onUpdate: () => {
                const value = Math.round(counter.value);
                // Avoid rerendering the page or rewriting unchanged digits each frame.
                if (percentage.current && value !== lastPercentage) {
                  percentage.current.textContent = String(value);
                  lastPercentage = value;
                }
              },
            },
            0,
          );
          sequence.to(
            progressBar.current,
            { scaleX: 1, duration, ease: "none" },
            0,
          );
          sequence.fromTo(
            `.${styles.reveal}`,
            { yPercent: 110, y: 0, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: reduced ? 0 : 1.5,
              stagger: reduced ? 0 : 0.18,
              ease: "power2.out",
            },
            0,
          );
          sequence.to(
            `.${styles.eyebrow}`,
            {
              opacity: 1,
              duration: reduced ? 0 : 0.65,
            },
            0,
          );
          sequence.to(
            `.${styles.disciplines}`,
            {
              opacity: 1,
              y: 0,
              duration: reduced ? 0 : 0.8,
            },
            reduced ? 0 : 0.6,
          );
        }, element);
      });
    };

    // Next/font supplies metric-adjusted fallbacks; don't wait for every page font.
    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      context?.revert();
      timeline.current = null;
    };
  }, [onComplete]);

  const skipIntro = () => {
    skipped.current = true;
    timeline.current?.kill();
    if (percentage.current) percentage.current.textContent = "100";
    if (progressBar.current) gsap.set(progressBar.current, { scaleX: 1 });
    onSkip();
  };

  return (
    <motion.div
      ref={root}
      initial={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { y: "-100%" }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.65,
        ease: [0.76, 0, 0.24, 1],
      }}
      className={styles.introduction}
      data-portfolio-intro
    >
      <div className={styles.topline}>
        <span className={styles.signature}>
          {config.author}
          <span>PORTFOLIO</span>
        </span>
        <button type="button" className={styles.skip} onClick={skipIntro}>
          Skip intro <ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.center}>
        <p className={styles.eyebrow}>HELLO, I’M {config.author}.</p>
        <p className={styles.headline} aria-label="Welcome to my portfolio">
          <span className={styles.line} aria-hidden="true">
            <span className={styles.reveal}>Welcome to</span>
          </span>
          <span className={styles.line} aria-hidden="true">
            <span className={styles.reveal}>my portfolio.</span>
          </span>
        </p>
        <p className={styles.disciplines}>
          Full-stack SaaS <span>·</span> Agentic AI <span>·</span> Web3
        </p>
      </div>
      <div className={styles.bottomline}>
        <div className={styles.loadingCopy} role="status">
          <span className={styles.statusDot} aria-hidden="true" />
          Opening the portfolio
        </div>
        <div className={styles.track} aria-hidden="true">
          <span ref={progressBar} />
        </div>
        <span className={styles.percentage} aria-hidden="true">
          <span ref={percentage} data-loading-percentage>
            0
          </span>
          <span className={styles.percentSign}>%</span>
        </span>
      </div>
    </motion.div>
  );
}
