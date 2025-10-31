"use client";

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function ParticlePlexus() {
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);
  const mouse = useRef(new THREE.Vector2());

  const particleCount = 150;
  const connectDistance = 1.5;

  const [particles] = useState(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  });

  useFrame((state) => {
    // Mouse Parallax
    mouse.current.x = (state.pointer.x * state.viewport.width) / 2;
    mouse.current.y = (state.pointer.y * state.viewport.height) / 2;
    state.camera.position.x += (mouse.current.x * 0.01 - state.camera.position.x) * 0.05;
    state.camera.position.y += (mouse.current.y * 0.01 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);

    // Particle Animation
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const lineVertices: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] += (Math.random() - 0.5) * 0.005;
      positions[i3 + 1] += (Math.random() - 0.5) * 0.005;

      if (positions[i3] > 5 || positions[i3] < -5) positions[i3] *= -0.99;
      if (positions[i3 + 1] > 5 || positions[i3 + 1] < -5) positions[i3 + 1] *= -0.99;

      // Check distance to other particles
      for (let j = i + 1; j < particleCount; j++) {
        const j3 = j * 3;
        const dx = positions[i3] - positions[j3];
        const dy = positions[i3 + 1] - positions[j3 + 1];
        const dz = positions[i3 + 2] - positions[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectDistance) {
          lineVertices.push(positions[i3], positions[i3 + 1], positions[i3 + 2]);
          lineVertices.push(positions[j3], positions[j3 + 1], positions[j3 + 2]);
        }
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <Points ref={pointsRef} positions={particles} stride={3}>
        <PointMaterial
          color="#4ade80"
          size={0.05}
          sizeAttenuation
          transparent
          depthWrite={false}
        />
      </Points>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color="#86efac"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </lineSegments>
    </>
  );
}