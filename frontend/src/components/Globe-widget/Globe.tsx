// Globe.tsx
// 材质来源: https://www.solarsystemscope.com/textures/

import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import React, { useMemo } from "react";
import { latLongToVector3, createGreatCircleArc } from "../../utils/geo";

interface GlobeProps {
  isDay: boolean;
  myLocation: { lat: number; lon: number };
  visitorLocation: { lat: number; lon: number };
  rotationY: number;
}

const radius = 2.0;

const Globe: React.FC<GlobeProps> = ({ isDay, myLocation, visitorLocation, rotationY }) => {
  const dayTexture = useTexture("/textures/8k_earth_daymap.jpg");
  const nightTexture = useTexture("/textures/8k_earth_nightmap.jpg");
  const texture = isDay ? dayTexture : nightTexture;

  const myPos = useMemo(() => latLongToVector3(myLocation.lat, myLocation.lon, radius), [myLocation]);
  const visitorPos = useMemo(() => latLongToVector3(visitorLocation.lat, visitorLocation.lon, radius), [visitorLocation]);

  const arcPoints = useMemo(() => createGreatCircleArc(myPos, visitorPos, 100), [myPos, visitorPos]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(arcPoints), [arcPoints]);

  return (
    <group rotation={[0, rotationY, 0]}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      <mesh position={myPos}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={visitorPos}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="yellow" />
      </mesh>

      <mesh>
        <tubeGeometry args={[curve, 100, 0.015, 3, false]} />
        <meshStandardMaterial emissive="#408eed" color="#434ff7" emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
};

export default Globe;
