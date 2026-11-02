import { SectionHeader } from "./section-header";
import { KEYBOARD_STACK, KEYBOARD_GROUPS } from "@/data/keyboard";
export default function SkillsSection() {
  return (
    <section id="skills" className="relative w-full min-h-dvh py-20">
      <SectionHeader
        id="skills"
        title="Stack & Tools"
        desc={`${KEYBOARD_STACK.length} technologies and tools I build with. Hover or slide across the keys to explore.`}
      />
      <p className="mb-4 px-6 text-center text-xs text-muted-foreground md:hidden">
        Slide across keys to press them. Scroll outside the keyboard to
        continue.
      </p>
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        <div
          data-keyboard-slot="skills"
          className="w-full h-[800px] max-md:h-[650px]"
          aria-hidden="true"
        />
        <div
          className="relative z-10 flex flex-wrap justify-center gap-5 font-sans text-xs text-muted-foreground"
          aria-label="Stack categories"
        >
          {KEYBOARD_GROUPS.map((group) => (
            <span key={group.title}>
              {group.title} · {group.skills.length}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
