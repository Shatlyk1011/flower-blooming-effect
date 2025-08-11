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
import Lenis from "lenis";

const FRAME_COUNT = 40;

function currentFrame(index: number) {
  return `/images/frames/${(index + 1).toString()}.png`;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
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

    const lenis = new Lenis();

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);


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
        end: `+=${window.innerHeight * 7}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: self => {
          const progress = self.progress;
          const animationProgress = Math.min(progress / 0.9, 1);
          const targetFrame = Math.round(animationProgress * (FRAME_COUNT - 1));
          videoFrames.current.frame = targetFrame;
          render();
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
    // eslint-disable-next-line
  }, []);

  // JSX
  return (
    <section className="hero">
      <canvas ref={canvasRef} className="w-full h-full object-cover grayscale-85"/>
    </section>
  );
}
