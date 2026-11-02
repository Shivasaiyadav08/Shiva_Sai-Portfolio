"use client";

import Particles from "@/components/particles";
import ElasticCursor from "@/components/ui/elastic-cursor";

export default function AppOverlays() {
  return (
    <>
      <Particles
        className="fixed inset-0 -z-10"
        quantity={100}
      />
      <ElasticCursor />
    </>
  );
}
