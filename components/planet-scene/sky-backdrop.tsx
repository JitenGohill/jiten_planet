"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { ShaderMaterial } from "three";

import { skyFragmentShader, skyVertexShader } from "./scene-shaders";

export function SkyBackdrop() {
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(({ clock }) => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false} position={[0, 0, -96]} renderOrder={-1000}>
      <planeGeometry args={[230, 136]} />
      <shaderMaterial
        depthTest={false}
        depthWrite={false}
        fragmentShader={skyFragmentShader}
        ref={materialRef}
        toneMapped={false}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={skyVertexShader}
      />
    </mesh>
  );
}
