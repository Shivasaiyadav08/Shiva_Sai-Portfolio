import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "default" | "outline";
  size?: "default" | "icon";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-can-hover [&_*]:pointer-events-none",
        variant === "outline"
          ? "border border-input bg-background"
          : "bg-primary text-primary-foreground",
        size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2",
        className,
      )}
      {...props}
    />
  );
}
