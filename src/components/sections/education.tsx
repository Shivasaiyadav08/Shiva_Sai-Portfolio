import { CERTIFICATIONS, EDUCATION } from "@/data/constants";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";

export default function EducationSection() {
  return (
    <SectionWrapper id="education" className="max-w-5xl mx-auto px-6 py-20">
      <SectionHeader id="education" title="Education & Certifications" />
      <div className="rounded-2xl border border-border bg-card/95 p-6 md:p-10 font-sans pointer-events-auto">
        <p className="text-sm text-violet-500 dark:text-violet-300 mb-3">
          {EDUCATION.dates} · {EDUCATION.grade}
        </p>
        <h3 className="text-2xl font-semibold">{EDUCATION.institution}</h3>
        <p className="text-muted-foreground mt-4">{EDUCATION.degree}</p>
        <p className="text-muted-foreground mt-2">
          {EDUCATION.specialization} · {EDUCATION.university}
        </p>
        <ul className="grid sm:grid-cols-2 gap-3 mt-8 border-t border-border pt-8">
          {CERTIFICATIONS.map((item) => (
            <li key={item} className="text-sm">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}
