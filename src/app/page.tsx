import ReactLenis from "lenis/react"

import Hero from "@/components/Hero";

export default function Home() {
  return (
    <ReactLenis root options={{ lerp: 0.135 }}>
      <main>
        <Hero />
        <div className="h-screen wscreen bg-zinc-800"></div>
      </main>
    </ReactLenis>
  );
}
