"use client";

import Particles from "@/components/effects/particles";
import ElasticCursor from "@/components/effects/elastic-cursor";

export default function BackgroundEffects() {
  return (
    <>
      <Particles className="fixed inset-0 -z-10" quantity={100} />
      <ElasticCursor />
    </>
  );
}
