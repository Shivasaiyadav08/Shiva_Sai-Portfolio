"use client";
import { ReactLenis } from "@/lib/lenis";
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis root options={{ duration: 1.2, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
