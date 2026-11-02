import { config } from "@/data/config";
import { SKILL_GROUPS, EDUCATION, CERTIFICATIONS } from "@/data/profile";
import ExperienceSection from "@/components/sections/experience";
import Image from "next/image";
import { Mail, Phone, Linkedin, Github, FileDown } from "lucide-react";

const profileLinkStyle =
  "inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card/80 text-foreground transition-colors hover:border-violet-400/60 hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
export const metadata = {
  title: "About | Shiva Sai Thota",
  description: config.description.long,
};
export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 pt-32 pb-20 font-sans">
      <div className="flex flex-col md:flex-row gap-8 md:items-center mb-12">
        <div className="w-40 shrink-0 rounded-[28px] border border-violet-400/30 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 p-1.5 shadow-lg shadow-violet-500/5">
          <Image
            src="/assets/profile/shiva-sai-thota.png"
            alt="Shiva Sai Thota wearing a graduation cap and gown outdoors"
            width={200}
            height={200}
            preload
            sizes="146px"
            className="aspect-square w-full rounded-[22px] object-cover"
          />
        </div>
        <div>
          <p className="text-violet-500 dark:text-violet-300 uppercase tracking-widest text-sm mb-3">
            About me
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {config.author}
          </h1>
          <p className="text-xl text-muted-foreground mt-3">
            {config.role} · {config.focus}
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            {config.location}
          </p>
        </div>
      </div>
      <p className="text-lg leading-relaxed text-muted-foreground max-w-4xl">
        {config.description.long} My work spans React and Next.js interfaces,
        Python/FastAPI and Node.js services, LangGraph research orchestration,
        and Solidity smart contracts with Foundry.
      </p>
      <nav
        aria-label="Contact and profiles"
        className="flex flex-wrap items-center gap-3 my-8 text-sm"
      >
        <a
          href={`mailto:${config.email}`}
          className={`${profileLinkStyle} w-11`}
          aria-label={`Email ${config.author}`}
          title={config.email}
        >
          <Mail size={20} aria-hidden="true" />
        </a>
        <a
          href={config.phoneHref}
          className={`${profileLinkStyle} w-11`}
          aria-label={`Call ${config.author}`}
          title={config.phone}
        >
          <Phone size={20} aria-hidden="true" />
        </a>
        <a
          href={config.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={`${profileLinkStyle} w-11`}
          aria-label={`${config.author} on LinkedIn`}
          title="LinkedIn"
        >
          <Linkedin size={20} aria-hidden="true" />
        </a>
        <a
          href={config.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className={`${profileLinkStyle} w-11`}
          aria-label={`${config.author} on GitHub`}
          title="GitHub"
        >
          <Github size={20} aria-hidden="true" />
        </a>
        <a
          href={config.resume}
          download
          className={`${profileLinkStyle} gap-2 px-4 font-medium`}
          aria-label="Download resume"
        >
          <FileDown size={19} aria-hidden="true" /> Resume
        </a>
      </nav>
      <ExperienceSection />
      <section
        aria-labelledby="education-heading"
        className="py-12 border-t border-border"
      >
        <h2 id="education-heading" className="text-3xl font-bold mb-6">
          Education
        </h2>
        <p className="text-xl font-semibold">{EDUCATION.institution}</p>
        <p className="text-muted-foreground mt-3">
          {EDUCATION.degree} · {EDUCATION.specialization}
        </p>
        <p className="text-muted-foreground mt-2">
          {EDUCATION.university} · {EDUCATION.location}
        </p>
        <p className="mt-4">
          {EDUCATION.dates} · {EDUCATION.grade}
        </p>
      </section>
      <section
        aria-labelledby="certifications-heading"
        className="py-12 border-t border-border"
      >
        <h2 id="certifications-heading" className="text-3xl font-bold mb-6">
          Certifications
        </h2>
        <ul className="grid sm:grid-cols-2 gap-4">
          {CERTIFICATIONS.map((item) => (
            <li key={item} className="p-4 rounded-xl border border-border">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section
        aria-labelledby="skills-heading"
        className="py-12 border-t border-border"
      >
        <h2 id="skills-heading" className="text-3xl font-bold mb-6">
          Technical skills
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {SKILL_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold mb-3">{group.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {group.skills.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
