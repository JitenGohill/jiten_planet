"use client";

import { OrbitControls } from "@react-three/drei";

import { GLOBE_BASE_Y } from "./constants";

export function InteractionControls({
  onInteractionChange,
}: {
  onInteractionChange: (isInteracting: boolean) => void;
}) {
  return (
    <OrbitControls
      dampingFactor={0.08}
      enableDamping
      enablePan={false}
      enableZoom
      makeDefault
      maxDistance={13}
      minDistance={3.4}
      onEnd={() => {
        document.body.style.cursor = "";
        onInteractionChange(false);
      }}
      onStart={() => {
        document.body.style.cursor = "grabbing";
        onInteractionChange(true);
      }}
      rotateSpeed={0.72}
      target={[0, GLOBE_BASE_Y, 0]}
      zoomSpeed={0.8}
    />
  );
}
