import ReactLenis from "lenis/react"

//components
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      <main>
        <Hero />
        <Projects />
        <div className="h-screen wscreen bg-zinc-800"></div>
      </main>
    </ReactLenis>
  );
}
