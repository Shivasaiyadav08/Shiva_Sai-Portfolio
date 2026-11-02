import { Mail } from "lucide-react";
import { config } from "@/data/config";

export default function EmailLink() {
  return (
    <a
      href={`mailto:${config.email}`}
      aria-label={`Email ${config.author}`}
      title={config.email}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-foreground transition-colors hover:border-violet-400/60 hover:bg-violet-400/10 hover:text-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <Mail size={20} aria-hidden="true" />
    </a>
  );
}
