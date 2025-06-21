import React, { useMemo } from "react";
import * as THREE from "three";

interface LightingProps {
  date: Date;
}

const Lighting: React.FC<LightingProps> = ({ date }) => {
  const sunDirection = useMemo(() => {
    const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
    const longitude = (hours / 24) * 360 // - 180; // 0h = -180°, 12h = 0°, 24h = +180°
    const latitude = -23.5 * Math.cos((2 * Math.PI * (date.getUTCMonth() + 1)) / 12); // 简化倾角

    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);
    const x = 100 * Math.sin(phi) * Math.cos(theta);
    const y = 100 * Math.cos(phi);
    const z = 100 * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }, [date]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={sunDirection.toArray()} intensity={1.2} />
    </>
  );
};

export default Lighting;
