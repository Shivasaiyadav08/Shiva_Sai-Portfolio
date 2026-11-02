import { Github, Linkedin } from "lucide-react";
import { config } from "@/data/config";
export default function SocialMediaButtons() {
  return (
    <div className="flex items-center gap-4 z-10">
      <a
        href={config.social.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Shiva Sai Thota on GitHub"
        className="p-2 hover:text-violet-400"
      >
        <Github size={22} />
      </a>
      <a
        href={config.social.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Shiva Sai Thota on LinkedIn"
        className="p-2 hover:text-violet-400"
      >
        <Linkedin size={22} />
      </a>
    </div>
  );
}
