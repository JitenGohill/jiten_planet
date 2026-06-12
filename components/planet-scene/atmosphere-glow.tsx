"use client";

import { AdditiveBlending, BackSide } from "three";

export function AtmosphereGlow({ radius }: { radius: number }) {
  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[radius, 64, 32]} />
      <meshBasicMaterial
        blending={AdditiveBlending}
        color="#6ef7ff"
        depthWrite={false}
        opacity={0.16}
        side={BackSide}
        transparent
      />
    </mesh>
  );
}
