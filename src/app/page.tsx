'use client'

import Hero from "@/components/Hero";
import ReactLenis from "lenis/react";

export default function Home() {
  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      <Hero />
    </ReactLenis>
  );
}
