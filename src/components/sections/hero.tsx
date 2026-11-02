"use client";
import Image from "next/image";
import { config } from "@/data/config";
import { FileDown, ArrowUpRight, MapPin } from "lucide-react";
import { Github, Linkedin } from "lucide-react";
import { IntroReveal } from "../effects/reveal";
import ScrollDownIcon from "../effects/scroll-down";
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full min-h-[100svh] grid items-center gap-6 lg:gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] px-6 md:px-12 lg:px-16 pt-32 pb-24 max-w-[1800px] mx-auto"
    >
      <div className="relative z-10 min-w-0">
        <IntroReveal delay={0.25}>
          <div className="flex items-center gap-5 mb-6">
            <div className="shrink-0 rounded-[24px] border border-violet-400/30 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 p-1.5 shadow-lg shadow-violet-500/5">
              <Image
                src="/assets/profile/shiva-sai-thota.png"
                alt="Shiva Sai Thota wearing a graduation cap and gown outdoors"
                width={200}
                height={200}
                preload
                sizes="96px"
                className="h-24 w-24 rounded-[18px] object-cover"
              />
            </div>
            <p className="text-xs sm:text-sm font-sans tracking-[.2em] uppercase text-violet-600 dark:text-violet-300">
              Software Engineer
            </p>
          </div>
        </IntroReveal>
        <IntroReveal delay={0.38}>
          <h1
            aria-label={config.author}
            className="text-[clamp(3rem,5.2vw,6rem)] leading-[1] tracking-tight font-display"
          >
            Shiva Sai
            <br />
            Thota<span className="text-violet-500">.</span>
          </h1>
        </IntroReveal>
        <IntroReveal delay={0.5}>
          <p className="font-sans text-lg sm:text-xl mt-7 text-muted-foreground">
            {config.focus}
          </p>
          <p className="font-sans text-sm sm:text-base max-w-md leading-relaxed text-muted-foreground mt-4">
            I build AI research workflows, full-stack workspaces, and
            decentralized applications, from the interface to the backend.
          </p>
          <p className="font-sans flex gap-2 items-center text-xs text-muted-foreground mt-5">
            <MapPin size={14} />
            {config.location}
          </p>
        </IntroReveal>
        <IntroReveal
          delay={0.62}
          className="font-sans mt-8 flex flex-wrap items-center gap-3"
        >
          <a
            href={config.resume}
            download
            className="inline-flex gap-2 items-center px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <FileDown size={18} /> Download resume
          </a>
          <a
            href="#projects"
            className="inline-flex gap-2 items-center px-5 py-3 rounded-lg border border-border bg-background/70 text-sm"
          >
            Explore my work <ArrowUpRight size={17} />
          </a>
          <a
            href={config.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shiva Sai Thota on GitHub"
            className="p-3 rounded-lg border border-border bg-background/70"
          >
            <Github size={20} />
          </a>
          <a
            href={config.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shiva Sai Thota on LinkedIn"
            className="p-3 rounded-lg border border-border bg-background/70"
          >
            <Linkedin size={20} />
          </a>
        </IntroReveal>
      </div>
      <div
        data-keyboard-slot="hero"
        className="absolute inset-0 lg:static lg:w-full lg:h-[560px]"
        aria-hidden="true"
      />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <IntroReveal delay={0.75}>
          <ScrollDownIcon />
        </IntroReveal>
      </div>
    </section>
  );
}
