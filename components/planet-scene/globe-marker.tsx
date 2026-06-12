"use client";

import { AdditiveBlending } from "three";

import type { LocationMarker, LocationMarkerId } from "./location-markers";

export function GlobeMarker({
  active,
  marker,
  markerRadius,
  onSelect,
}: {
  active: boolean;
  marker: LocationMarker;
  markerRadius: number;
  onSelect: (id: LocationMarkerId) => void;
}) {
  const position = latLonToPosition(marker.lat, marker.lon, markerRadius);

  return (
    <group position={position}>
      <mesh scale={active ? 1.75 : 1.35}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={active ? "#ff4d4d" : "#ff2d2d"}
          depthWrite={false}
          opacity={active ? 0.24 : 0.16}
          transparent
        />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "";
          onSelect(marker.id);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
      >
        <sphereGeometry args={[active ? 0.075 : 0.06, 20, 20]} />
        <meshStandardMaterial
          color={active ? "#ff4d4d" : "#ff2d2d"}
          emissive={active ? "#ff1a1a" : "#b50000"}
          emissiveIntensity={active ? 2.6 : 1.7}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function latLonToPosition(lat: number, lon: number, radius: number): [number, number, number] {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const cosLat = Math.cos(latRad);

  return [
    cosLat * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    -cosLat * Math.sin(lonRad) * radius,
  ];
}
