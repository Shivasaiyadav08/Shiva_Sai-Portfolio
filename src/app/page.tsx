import SmoothScroll from "@/components/layout/smooth-scroll";
import SkillsSection from "@/components/sections/skills";
import ExperienceSection from "@/components/sections/experience";
import ProjectsSection from "@/components/sections/projects";
import ContactSection from "@/components/sections/contact";
import HeroSection from "@/components/sections/hero";
import EducationSection from "@/components/sections/education";
import ScrollKeyboard from "@/components/keyboard/scroll-keyboard";

function MainPage() {
  return (
    <SmoothScroll>
      <main className="bg-slate-100 dark:bg-transparent canvas-overlay-mode">
        <HeroSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <EducationSection />
        <ContactSection />
        <ScrollKeyboard />
      </main>
    </SmoothScroll>
  );
}

export default MainPage;
