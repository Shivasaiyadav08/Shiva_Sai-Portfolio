import { cn } from "@/lib/utils";
import Link from "next/link";
import { BoxReveal } from "../effects/reveal";
import { ReactNode } from "react";

export const SectionHeader = ({
  id,
  title,
  desc,
  className,
}: {
  id: string;
  title: string | ReactNode;
  desc?: string;
  className?: string;
}) => {
  return (
    <div className={cn("mb-12 px-4", className)}>
      <Link href={`#${id}`}>
        <BoxReveal width="100%">
          <h2
            className={cn(
              "text-3xl text-center md:text-5xl font-bold",
              "text-foreground font-display",
            )}
          >
            {title}
          </h2>
        </BoxReveal>
      </Link>
      <p className="mx-auto line-clamp-4 max-w-3xl font-sans mt-4 font-normal text-base text-center text-muted-foreground">
        {desc}
      </p>
    </div>
  );
};
