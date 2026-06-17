"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { type ReactNode, useMemo, useRef } from "react";
import type { Group } from "three";

import { AtmosphereGlow } from "./atmosphere-glow";
import { GLOBE_BASE_Y, GLOBE_MODEL_PATH, hiddenModelObjects } from "../constants";
import { GlobeMarker } from "./globe-marker";
import { locationMarkers, type LocationMarkerId } from "@/content/locations";
import { getVisibleModelRadius } from "./model-bounds";

export function BlenderGlobe({
  children,
  isUserInteracting,
  onSelectMarker,
  selectedMarkerId,
}: {
  children?: ReactNode;
  isUserInteracting: boolean;
  onSelectMarker: (id: LocationMarkerId) => void;
  selectedMarkerId: LocationMarkerId | null;
}) {
  const { scene } = useGLTF(GLOBE_MODEL_PATH);
  const globeRef = useRef<Group>(null);
  const { viewport } = useThree();

  const modelRadius = useMemo(() => {
    scene.traverse((object) => {
      if (hiddenModelObjects.has(object.name)) {
        object.visible = false;
      }
    });

    return getVisibleModelRadius(scene);
  }, [scene]);
  const maxGlobeDiameter = Math.min(viewport.width * 0.88, viewport.height * 0.76);
  const globeScale = Math.min(1.05, maxGlobeDiameter / Math.max(modelRadius * 2, 1));
  const markerRadius = modelRadius * 1.06;

  useFrame(({ clock }, delta) => {
    const globe = globeRef.current;

    if (!globe) {
      return;
    }

    if (!isUserInteracting) {
      globe.rotation.y += delta * 0.06;
    }

    globe.rotation.x = -0.13 + Math.sin(clock.elapsedTime * 0.32) * 0.01;
    globe.rotation.z = -0.06 + Math.sin(clock.elapsedTime * 0.26) * 0.005;
    globe.position.y = GLOBE_BASE_Y + Math.sin(clock.elapsedTime * 0.45) * 0.04;
  });

  return (
    <group
      position={[0, GLOBE_BASE_Y, 0]}
      ref={globeRef}
      rotation={[-0.13, -0.28, -0.06]}
      scale={globeScale}
    >
      <primitive object={scene} />
      <AtmosphereGlow radius={modelRadius * 1.1} />
      {locationMarkers.map((marker) => (
        <GlobeMarker
          active={marker.id === selectedMarkerId}
          key={marker.id}
          marker={marker}
          markerRadius={markerRadius}
          onSelect={onSelectMarker}
        />
      ))}
      {children}
    </group>
  );
}

useGLTF.preload(GLOBE_MODEL_PATH);
