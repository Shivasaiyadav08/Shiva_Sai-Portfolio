import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
export default function NotFoundPage() {
  return (
    <main className="min-h-[85dvh] flex flex-col items-center justify-center px-6 pt-28 pb-16 text-center font-sans">
      <p className="text-violet-400 text-sm tracking-[.3em] uppercase">
        404 · Page not found
      </p>
      <h1 className="mt-6 text-4xl sm:text-6xl font-display max-w-3xl">
        A little off the map.
      </h1>
      <p className="mt-6 max-w-md text-muted-foreground leading-relaxed">
        This page has moved or does not exist. There is still plenty to explore
        in my portfolio.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm"
        >
          <ArrowLeft size={16} /> Back home
        </Link>
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm"
        >
          View projects <ArrowUpRight size={16} />
        </Link>
      </div>
    </main>
  );
}
