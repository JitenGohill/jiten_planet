"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BackSide, type ShaderMaterial } from "three";

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
    <mesh frustumCulled={false} renderOrder={-1000}>
      <sphereGeometry args={[118, 96, 48]} />
      <shaderMaterial
        depthTest={false}
        depthWrite={false}
        fragmentShader={skyFragmentShader}
        ref={materialRef}
        side={BackSide}
        toneMapped={false}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={skyVertexShader}
      />
    </mesh>
  );
}
