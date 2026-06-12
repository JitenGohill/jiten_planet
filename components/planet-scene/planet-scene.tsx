"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";

import { BlenderGlobe } from "./blender-globe";
import { InteractionControls } from "./interaction-controls";
import { LocationCard } from "./location-card";
import { locationMarkers, type LocationMarkerId } from "./location-markers";
import { SceneLights } from "./scene-lights";
import { SkyBackdrop } from "./sky-backdrop";
import { StarField } from "./star-field";

export default function PlanetScene() {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<LocationMarkerId | null>(null);
  const selectedMarker = locationMarkers.find((marker) => marker.id === selectedMarkerId);

  return (
    <div className="relative h-screen w-screen touch-none overflow-hidden bg-black">
      <Canvas
        aria-label="Stylized three-dimensional purple space background"
        camera={{ far: 220, fov: 50, near: 0.1, position: [0, 0, 7.5] }}
        className="absolute inset-0"
        dpr={[1, 1.75]}
        gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
        onPointerMissed={() => {
          document.body.style.cursor = "";
          setSelectedMarkerId(null);
        }}
        role="img"
      >
        <color args={["#05001a"]} attach="background" />
        <fog args={["#080028", 62, 165]} attach="fog" />
        <SkyBackdrop />
        <StarField />
        <SceneLights />
        <InteractionControls onInteractionChange={setIsUserInteracting} />
        <Suspense fallback={null}>
          <BlenderGlobe
            isUserInteracting={isUserInteracting}
            onSelectMarker={setSelectedMarkerId}
            selectedMarkerId={selectedMarkerId}
          />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-5 sm:justify-end sm:px-7 sm:pb-7">
        {selectedMarker ? (
          <LocationCard marker={selectedMarker} onClose={() => setSelectedMarkerId(null)} />
        ) : (
          <div className="rounded-full border border-white/15 bg-slate-950/55 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/80 shadow-2xl shadow-cyan-950/40 backdrop-blur-md">
            Drag to spin / scroll or pinch to zoom / select a pin
          </div>
        )}
      </div>
    </div>
  );
}
