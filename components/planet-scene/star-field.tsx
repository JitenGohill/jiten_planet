"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AdditiveBlending, Color, type Group, type Points } from "three";

import { starFragmentShader, starVertexShader } from "./scene-shaders";

type StarLayer = {
  colors: Float32Array;
  count: number;
  opacity: number;
  positions: Float32Array;
  rotationSpeed: number;
  sizes: Float32Array;
};

const starLayers: StarLayer[] = [
  createStarLayer({
    count: 2300,
    maxRadius: 105,
    minRadius: 42,
    opacity: 0.62,
    rotationSpeed: 0.003,
    seed: 11,
    size: [1.55, 3.6],
  }),
  createStarLayer({
    count: 980,
    maxRadius: 92,
    minRadius: 28,
    opacity: 0.78,
    rotationSpeed: -0.006,
    seed: 29,
    size: [2.4, 5.4],
  }),
  createStarLayer({
    count: 48,
    maxRadius: 82,
    minRadius: 24,
    opacity: 0.74,
    rotationSpeed: 0.008,
    seed: 47,
    size: [8, 18],
  }),
];

export function StarField() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    group.rotation.y += delta * 0.012;
    group.rotation.x = Math.sin(clock.elapsedTime * 0.05) * 0.025;
  });

  return (
    <group ref={groupRef}>
      {starLayers.map((layer, index) => (
        <RotatingStarLayer index={index} key={index} layer={layer} />
      ))}
    </group>
  );
}

function RotatingStarLayer({ index, layer }: { index: number; layer: StarLayer }) {
  const pointsRef = useRef<Points>(null);

  useFrame((_, delta) => {
    const points = pointsRef.current;

    if (!points) {
      return;
    }

    points.rotation.y += delta * layer.rotationSpeed;
    points.rotation.z += delta * layer.rotationSpeed * 0.35;
  });

  return (
    <points ref={pointsRef} rotation={[index * 0.42, index * 0.25, 0]}>
      <bufferGeometry>
        <bufferAttribute
          args={[layer.positions, 3]}
          attach="attributes-position"
          count={layer.count}
        />
        <bufferAttribute
          args={[layer.colors, 3]}
          attach="attributes-color"
          count={layer.count}
        />
        <bufferAttribute
          args={[layer.sizes, 1]}
          attach="attributes-size"
          count={layer.count}
        />
      </bufferGeometry>
      <shaderMaterial
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={starFragmentShader}
        transparent
        uniforms={{ opacity: { value: layer.opacity } }}
        vertexColors
        vertexShader={starVertexShader}
      />
    </points>
  );
}

function createStarLayer({
  count,
  maxRadius,
  minRadius,
  opacity,
  rotationSpeed,
  seed,
  size,
}: {
  count: number;
  maxRadius: number;
  minRadius: number;
  opacity: number;
  rotationSpeed: number;
  seed: number;
  size: [number, number];
}): StarLayer {
  const colors = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const random = seededRandom(seed);

  for (let index = 0; index < count; index += 1) {
    const radius = minRadius + Math.pow(random(), 0.62) * (maxRadius - minRadius);
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const offset = index * 3;

    positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[offset + 2] = radius * Math.cos(phi);

    const color = starColor(random()).multiplyScalar(0.45 + random() * 0.75);

    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
    sizes[index] = size[0] + Math.pow(random(), 2.8) * (size[1] - size[0]);
  }

  return {
    colors,
    count,
    opacity,
    positions,
    rotationSpeed,
    sizes,
  };
}

function seededRandom(seed: number) {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;

    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function starColor(value: number) {
  if (value < 0.64) {
    return new Color("#f8fbff");
  }

  if (value < 0.82) {
    return new Color("#b9d9ff");
  }

  if (value < 0.95) {
    return new Color("#ffe3a3");
  }

  return new Color("#ffb39a");
}
