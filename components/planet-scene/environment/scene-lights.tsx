"use client";

export function SceneLights() {
  return (
    <>
      <ambientLight color="#8ec8ff" intensity={0.72} />
      <directionalLight color="#ffd180" intensity={3.6} position={[-4.6, 3.7, 5.2]} />
      <directionalLight color="#68f5ff" intensity={2.1} position={[4.4, 1.1, -5.4]} />
    </>
  );
}
