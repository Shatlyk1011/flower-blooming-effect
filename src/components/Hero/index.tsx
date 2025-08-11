// import { useRef } from "react";

// const Hero = () => {
//   const canvasRef = useRef(null)

//   return (
//     <section className="">
//       <canvas ref={canvasRef}></canvas>
//     </section>
//   )
// };
// export default Hero
'use client'

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_COUNT = 40;

function currentFrame(index: number) {
  return `/images/frames/${(index + 1).toString()}.png`;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null)

  const videoFrames = useRef({ frame: 0 });

  // Set canvas size, scales for devicePixelRatio
  function setCanvasSize() {
    if(!canvasRef.current) return
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")!;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset any transform
    context.scale(pixelRatio, pixelRatio);
  }

  function render() {
    if(!canvasRef.current) return

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")!;
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const img = imagesRef.current[videoFrames.current.frame] as HTMLImageElement;
    if (img && img.complete && img.naturalWidth > 0) {
      const imageAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvasWidth / canvasHeight;
      let drawWidth, drawHeight, drawX, drawY;
      if (imageAspect > canvasAspect) {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imageAspect;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imageAspect;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      }
      context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
    }

  // Load images when component mounts
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    setCanvasSize();

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    // Load all frames
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = images;
          render();
          setupScrollTrigger();
        }
      };
      img.src = currentFrame(i);
      images.push(img);
    }

    function setupScrollTrigger() {
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: `+=${window.innerHeight * 2.5}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: self => {
          const progress = self.progress;
          const animationProgress = Math.min(progress / 0.9, 1);
          const targetFrame = Math.round(animationProgress * (FRAME_COUNT - 1));
          videoFrames.current.frame = targetFrame;
          render();

          if (contentRef.current) {
            if (progress <= 0.8) {
              const zProgress = progress / 0.1;
              const translateZ = zProgress * -600;
              let opacity = 1;
              if (progress >= 0.2) {
                const fadeProgress = Math.min((progress - 0.5) / (0.25 - 0.2), 1);
                opacity = 1 - fadeProgress;
              }
              gsap.set(contentRef.current, {
                transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
                opacity,
              });
            } else {
              gsap.set(contentRef.current, { opacity: 0 });
            }
          }
        },
      });
    }

    // Window resize
    function handleResize() {
      setCanvasSize();
      render();
      ScrollTrigger.refresh();
    }
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section className="hero relative bg-gradient-to-t from-red-500 to-foreground">
      <canvas ref={canvasRef} className="w-full h-full object-cover grayscale-90 -z-1 " />
      <div className="w-full py-2 transform-3d perspective-distant h-full fixed top-0">
        <div ref={contentRef} className="absolute text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full origin-center will-change-transform text-background">
          <h1 className="text-[11rem] leading-[105%] mb-[1rem] font-bold -tracking-two">BOLD IDEAS. <br /> BRILLIANT DESIGN.</h1>

          <p className="text-[4rem] leading-[110%] font-medium -tracking-two">Make a <span className="bg-background text-foreground px-[1rem]">statement.</span> Build confidence. <br /> Impress your audience.</p>
        </div>
      </div>

    </section>
  );
}
