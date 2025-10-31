"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import ParticlePlexus from "./ParticlePlexus";

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      className="fixed! top-0 left-0 w-full h-full -z-10 opacity-60 dark:opacity-80"
    >
      <Suspense fallback={null}>
        <ParticlePlexus />
      </Suspense>
    </Canvas>
  );
}
