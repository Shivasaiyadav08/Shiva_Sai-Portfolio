"use client";

import { useId, useState, type CSSProperties } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Github, X } from "lucide-react";
import projects, { type Project } from "@/data/projects";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import styles from "./projects.module.css";

type ProjectFilter = "all" | Project["kind"];
const filters: { id: ProjectFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "personal", label: "Personal" },
  { id: "freelancing", label: "Freelancing" },
];
const kindLabels = { personal: "Personal", freelancing: "Freelancing" };

export function ProjectGrid({
  eagerFirstImage = false,
}: {
  eagerFirstImage?: boolean;
}) {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const resultsId = useId();
  const visible = projects.filter(
    (project) => filter === "all" || project.kind === filter,
  );
  const coverSizes =
    visible.length === 2
      ? "(max-width: 640px) calc(100vw - 64px), (max-width: 1280px) calc((100vw - 120px) / 2), 600px"
      : "(max-width: 640px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 120px) / 2), (max-width: 1280px) calc((100vw - 160px) / 3), 384px";

  return (
    <div className={styles.collection}>
      <div className={styles.toolbar}>
        <div
          className={styles.filters}
          role="group"
          aria-label="Filter projects"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              aria-controls={resultsId}
              onClick={() => setFilter(item.id)}
              className={styles.filter}
            >
              {item.label}
              <span aria-hidden="true">
                {item.id === "all"
                  ? projects.length
                  : projects.filter((project) => project.kind === item.id)
                      .length}
              </span>
            </button>
          ))}
        </div>
        <p
          className={styles.resultCount}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
      </div>
      <div
        id={resultsId}
        role="region"
        aria-label="Project results"
        className={styles.grid}
        data-count={visible.length}
      >
        {visible.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            coverSizes={coverSizes}
            eagerImage={eagerFirstImage && index === 0}
          />
        ))}
        {visible.length === 0 && (
          <p className={styles.empty}>No projects in this category yet.</p>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  coverSizes,
  eagerImage,
}: {
  project: Project;
  coverSizes: string;
  eagerImage: boolean;
}) {
  const accent = { "--project-accent": project.accent } as CSSProperties;
  const tags = project.stack;
  // Responsive immutable files, with no first-visit server conversion work.
  const imageLoader = ({ width }: { width: number }) => {
    const image =
      width <= project.preview.width ? project.preview : project.src;
    return `${image.src}?w=${image.width}`;
  };
  return (
    <Dialog.Root>
      <article
        className={styles.card}
        style={accent}
        data-project-id={project.id}
        data-project-kind={project.kind}
      >
        <div className={styles.preview}>
          <Image
            src={project.src}
            alt={project.imageAlt}
            loader={imageLoader}
            sizes={coverSizes}
            placeholder="blur"
            loading={eagerImage ? "eager" : "lazy"}
            fetchPriority={eagerImage ? "high" : undefined}
            className={styles.cover}
          />
          <span className={styles.previewHint}>
            View project <ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </div>
        <div className={styles.body}>
          <div className={styles.meta}>
            <p className={styles.category}>{project.category}</p>
            <span className={styles.kind}>{kindLabels[project.kind]}</span>
          </div>
          <h3 className={styles.title}>
            {project.title}
            <ArrowUpRight size={22} aria-hidden="true" />
          </h3>
          <p className={styles.summary}>{project.summary}</p>
          {tags.length > 0 && (
            <ul className={styles.tags} aria-label="Technology stack">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
        <Dialog.Trigger
          type="button"
          className={styles.cardTrigger}
          aria-label={`View ${project.title} project details`}
        />
        <footer className={styles.cardFooter}>
          <ProjectLinks project={project} />
        </footer>
      </article>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content
          className={styles.dialogContent}
          style={accent}
          data-lenis-prevent
        >
          <Dialog.Close
            aria-label="Close project details"
            className={styles.dialogClose}
          >
            <X size={20} aria-hidden="true" />
          </Dialog.Close>
          <div className={styles.dialogCover}>
            <Image
              src={project.src}
              alt={project.imageAlt}
              loader={imageLoader}
              sizes="(max-width: 768px) calc(100vw - 72px), 792px"
              placeholder="blur"
              loading="eager"
            />
          </div>
          <div className={styles.meta}>
            <p className={styles.category}>{project.category}</p>
            <span className={styles.kind}>{kindLabels[project.kind]}</span>
          </div>
          <Dialog.Title className={styles.dialogTitle}>
            {project.title}
          </Dialog.Title>
          <Dialog.Description className={styles.dialogDescription}>
            {project.subtitle}. {project.summary}
          </Dialog.Description>
          {project.stack.length > 0 && (
            <ul className={styles.tags} aria-label="Technology stack">
              {project.stack.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          )}
          <h4 className={styles.highlightsTitle}>Project highlights</h4>
          <ul className={styles.highlights}>
            {project.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className={styles.dialogLinks}>
            <ProjectLinks project={project} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <>
      <a
        href={project.live}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.liveLink}
      >
        {project.kind === "freelancing" ? "Visit website" : "Live app"}
        <ArrowUpRight size={15} aria-hidden="true" />
      </a>
      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.sourceLink}
        >
          <Github size={15} aria-hidden="true" />
          {project.contractGithub ? "Frontend" : "Source code"}
        </a>
      )}
      {project.contractGithub && (
        <a
          href={project.contractGithub}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.sourceLink}
        >
          Contracts
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      )}
    </>
  );
}

export default function ProjectsSection() {
  return (
    <SectionWrapper id="projects" className="max-w-7xl mx-auto py-20 z-10">
      <SectionHeader
        id="projects"
        title="Selected Projects"
        desc="Personal explorations and freelance work. From research agents to real-world business websites."
      />
      <ProjectGrid />
    </SectionWrapper>
  );
}
