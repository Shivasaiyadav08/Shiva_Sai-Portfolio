import { ProjectGrid } from "@/components/sections/projects";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("/projects");
export default function ProjectsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 pt-32 pb-20 min-h-screen font-sans">
      <p className="uppercase tracking-widest text-sm text-violet-500 dark:text-violet-300 mb-4">
        Selected work
      </p>
      <h1 className="text-4xl md:text-6xl font-bold mb-5">
        From idea to application.
      </h1>
      <p className="text-muted-foreground max-w-2xl mb-12">
        Personal projects and freelance work across AI, SaaS, blockchain, and
        business websites. Explore the details or visit the live projects.
      </p>
      <ProjectGrid eagerFirstImage />
    </main>
  );
}
