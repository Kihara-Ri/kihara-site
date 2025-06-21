// Globe.tsx
// 材质来源: https://www.solarsystemscope.com/textures/

import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import React, { useMemo } from "react";
import { latLongToVector3 } from "../../utils/geo";
import FixedSizeSprite from "./FixedSizeSprite";
import AnimatedArc from "./AnimatedArc";

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

  // 加载精灵贴图（512px PNG）
  const [meIcon, visitorIcon] = useTexture([
    "/icons/my-location.png",
    "/icons/location.png"
  ]);

  // 关闭纹理平滑，避免图片变糊
  meIcon.minFilter = THREE.LinearFilter;
  meIcon.magFilter = THREE.NearestFilter;
  visitorIcon.minFilter = THREE.LinearFilter;
  visitorIcon.magFilter = THREE.NearestFilter;

  // 两个位置
  const myPos = useMemo(() => latLongToVector3(myLocation.lat, myLocation.lon, radius + 0.01), [myLocation]); // +0.01 防止图标被遮挡和闪烁
  const visitorPos = useMemo(() => latLongToVector3(visitorLocation.lat, visitorLocation.lon, radius + 0.01), [visitorLocation]);

  // 球面路径
  // const arcPoints = useMemo(() => createGreatCircleArc(myPos, visitorPos, 100), [myPos, visitorPos]);
  // const curve = useMemo(() => new THREE.CatmullRomCurve3(arcPoints), [arcPoints]);

  return (
    <group rotation={[0, rotationY, 0]}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* 位置图标：动态缩放保持视觉不变 */}
      <FixedSizeSprite texture={meIcon} position={myPos} size={0.05} />
      <FixedSizeSprite texture={visitorIcon} position={visitorPos} size={0.05} />

      <AnimatedArc
        from={myLocation}
        to={visitorLocation}
      />
    </group>
  );
};

export default Globe;
