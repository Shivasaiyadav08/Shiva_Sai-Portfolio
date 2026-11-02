"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion as Motion, useReducedMotion } from "framer-motion";
import TechKeyboard from "./tech-keyboard";
import { usePreloader } from "../preloader/context";
import styles from "./scroll-keyboard.module.css";

import type { KeyboardMotion } from "./types";

// A single scene travels between sections, retaining selection, sound and GPU resources.
export default function ScrollKeyboard() {
  const { isLoading } = usePreloader();
  const reduceMotion = useReducedMotion();
  const layerRef = useRef<HTMLDivElement>(null);
  const motion = useRef<KeyboardMotion>({
    rotation: [0, 0, 0],
    explode: 0,
    showDescription: false,
  });

  useEffect(() => {
    const layer = layerRef.current;
    const hero = document.querySelector<HTMLElement>(
      '[data-keyboard-slot="hero"]',
    );
    const skills = document.querySelector<HTMLElement>(
      '[data-keyboard-slot="skills"]',
    );
    const heroSection = document.getElementById("hero");
    const experience = document.getElementById("experience");
    const projects = document.getElementById("projects");
    const contact = document.querySelector<HTMLElement>(
      '[data-keyboard-slot="contact"]',
    );
    if (
      !layer ||
      !hero ||
      !heroSection ||
      !skills ||
      !experience ||
      !projects ||
      !contact
    )
      return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const pose = {
      x: 0,
      y: 0,
      scale: 1,
      rx: 0,
      ry: 0,
      rz: 0,
      explode: 0,
      opacity: 1,
    };
    let initialized = false;
    let tween: gsap.core.Tween | undefined;
    const paint = () => {
      layer.style.transform = `translate3d(${pose.x}px,${pose.y}px,0) scale(${pose.scale})`;
      layer.style.opacity = String(pose.opacity);
      layer.style.setProperty(
        "--keyboard-controls-scale",
        String(1 / pose.scale),
      );
      // Keep phone controls beside the board at the viewport's right edge.
      layer.style.setProperty(
        "--keyboard-controls-right",
        `${(pose.x + 1000 * pose.scale - document.documentElement.clientWidth + 16) / pose.scale}px`,
      );
      motion.current.rotation = [pose.rx, pose.ry, pose.rz];
      motion.current.explode = pose.explode;
      motion.current.invalidate?.();
    };
    const rectPose = (element: HTMLElement, height: number) => {
      const rect = element.getBoundingClientRect();
      const scale = Math.min(rect.width / 1000, rect.height / height);
      return {
        x: rect.left + (rect.width - 1000 * scale) / 2,
        y: rect.top + (rect.height - height * scale) / 2,
        scale,
      };
    };
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const mobile = vw < 768;
      // A portrait canvas gives the 5 × 10 phone layout room for touch-sized keys.
      const sceneHeight = mobile ? 1800 : 800;
      layer.style.height = `${sceneHeight}px`;
      layer.style.setProperty("--keyboard-height", `${sceneHeight - 60}px`);
      // Match the hero's lg two-column layout: smaller widths use a backdrop.
      const backgroundHero = vw < 1024;
      const skillRect = skills.getBoundingClientRect();
      const skillProgress = gsap.utils.clamp(
        0,
        1,
        (vh * 0.95 - skillRect.top) / (vh * 0.75),
      );
      const heroPose = rectPose(hero, sceneHeight);
      if (backgroundHero) {
        const heroRect = heroSection.getBoundingClientRect();
        heroPose.scale = Math.min((vw * 1.12) / 1000, (vh - 140) / sceneHeight);
        heroPose.x = (vw - 1000 * heroPose.scale) / 2;
        heroPose.y =
          heroRect.top +
          Math.min(heroRect.height * 0.52, vh * 0.56) -
          (sceneHeight / 2) * heroPose.scale;
      } else
        heroPose.y = Math.max(
          75,
          Math.min(heroPose.y, vh - sceneHeight * heroPose.scale - 20),
        );
      const skillPose = rectPose(skills, sceneHeight);
      // Dock the full board in the viewport while its section is being explored.
      skillPose.scale = Math.min(skillPose.scale, (vh - 110) / sceneHeight);
      skillPose.x = (vw - 1000 * skillPose.scale) / 2;
      skillPose.y = Math.max(60, skillPose.y);
      let section = skillProgress > 0.6 ? "skills" : "hero";
      let target = {
        x: gsap.utils.interpolate(heroPose.x, skillPose.x, skillProgress),
        y: gsap.utils.interpolate(heroPose.y, skillPose.y, skillProgress),
        scale: gsap.utils.interpolate(
          heroPose.scale,
          skillPose.scale,
          skillProgress,
        ),
        rx: 0,
        ry: (mobile ? 0.05 : 1.05) * skillProgress,
        rz: 0,
        explode: 0,
        opacity: gsap.utils.interpolate(
          backgroundHero ? 0.2 : 1,
          1,
          Math.min(1, skillProgress / 0.6),
        ),
      };
      const experienceProgress = Math.max(
        gsap.utils.clamp(
          0,
          1,
          (vh * 0.85 - experience.getBoundingClientRect().top) / (vh * 0.55),
        ),
        gsap.utils.clamp(0, 1, (vh * 0.92 - skillRect.bottom) / (vh * 0.38)),
      );
      const projectProgress = gsap.utils.clamp(
        0,
        1,
        (vh * 0.85 - projects.getBoundingClientRect().top) / (vh * 0.55),
      );
      if (experienceProgress > 0) {
        section = projectProgress > 0.5 ? "projects" : "experience";
        const size = mobile ? Math.min(0.22, (vh * 0.28) / sceneHeight) : 0.32;
        target = {
          x: gsap.utils.interpolate(
            target.x,
            vw - 1000 * size - 12,
            experienceProgress,
          ),
          y: gsap.utils.interpolate(
            target.y,
            vh - sceneHeight * size - 18,
            experienceProgress,
          ),
          scale: gsap.utils.interpolate(target.scale, size, experienceProgress),
          rx: 0.1 * experienceProgress + Math.PI * projectProgress,
          ry: 1.05 + 1.6 * projectProgress,
          rz: Math.PI * projectProgress,
          explode: 0,
          opacity: gsap.utils.interpolate(1, 0.24, experienceProgress),
        };
      }
      const contactProgress = gsap.utils.clamp(
        0,
        1,
        (vh * 0.9 - contact.getBoundingClientRect().top) / (vh * 0.6),
      );
      if (contactProgress > 0) {
        const destination = rectPose(contact, sceneHeight);
        section = "contact";
        target = {
          x: gsap.utils.interpolate(target.x, destination.x, contactProgress),
          y: gsap.utils.interpolate(target.y, destination.y, contactProgress),
          scale: gsap.utils.interpolate(
            target.scale,
            destination.scale,
            contactProgress,
          ),
          rx: gsap.utils.interpolate(target.rx, -0.15, contactProgress),
          ry: gsap.utils.interpolate(target.ry, 0.6, contactProgress),
          rz: gsap.utils.interpolate(target.rz, 0, contactProgress),
          explode: media.matches ? 0 : contactProgress,
          opacity: gsap.utils.interpolate(target.opacity, 1, contactProgress),
        };
      }
      if (mobile && section === "skills") {
        // Keep the board below the section copy, then let it grow as that copy scrolls away.
        target.y = Math.max(target.y, skillRect.top - 16);
        target.scale = Math.min(
          target.scale,
          (vh - target.y - 16) / sceneHeight,
        );
        target.x = (vw - 1000 * target.scale) / 2;
      }
      const decorativeHero = section === "hero" && backgroundHero;
      const interactive =
        (section === "hero" && !decorativeHero) || section === "skills";
      layer.dataset.section = section;
      layer.dataset.interactive = String(interactive);
      layer.dataset.presentation = decorativeHero ? "background" : "standard";
      layer.inert = !interactive;
      motion.current.showDescription = section === "skills";
      if (media.matches) {
        target.rx = target.ry = target.rz = target.explode = 0;
      }
      tween?.kill();
      if (!initialized || media.matches) {
        Object.assign(pose, target);
        paint();
        initialized = true;
      } else
        tween = gsap.to(pose, {
          ...target,
          duration: 0.6,
          ease: "power2.out",
          onUpdate: paint,
        });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    const resize = new ResizeObserver(schedule);
    [hero, skills, contact, document.body].forEach((element) =>
      resize.observe(element),
    );
    update();
    return () => {
      tween?.kill();
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className={styles.floating}
      data-scroll-keyboard
      data-section="hero"
    >
      <Motion.div
        className={styles.entrance}
        style={{ willChange: "transform, opacity" }}
        initial={{ opacity: 0, y: 36, scale: 0.94 }}
        animate={{
          opacity: isLoading ? 0 : 1,
          y: isLoading && !reduceMotion ? 36 : 0,
          scale: isLoading && !reduceMotion ? 0.94 : 1,
        }}
        transition={{
          duration: reduceMotion ? 0.15 : 1.15,
          delay: isLoading || reduceMotion ? 0 : 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        data-keyboard-entrance={isLoading ? "waiting" : "ready"}
      >
        <TechKeyboard motion={motion} />
      </Motion.div>
    </div>
  );
}
