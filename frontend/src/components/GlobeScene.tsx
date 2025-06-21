import React, { useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Globe from "./Globe-widget/Globe";
import Lighting from "./Globe-widget/Lightning";
import * as THREE from "three";
import { latLongToVector3 } from "../utils/geo";

interface GlobeSceneProps {
  myLocation: { lat: number; lon: number };
  visitorLocation: { lat: number; lon: number };
  isDay: boolean;
}

const GlobeScene: React.FC<GlobeSceneProps> = ({ myLocation, visitorLocation, isDay }) => {
  const [date, setDate] = useState(new Date());
  const maxDistance = Number(8.0);
  const minDistance = Number(3.0);
  const [zoom, setZoom] = useState(maxDistance);

  // 同步 zoom 缩放到相机位置
  const CameraUpdater = ({ zoom }: { zoom: number }) => {
    const { camera, controls } = useThree();
    const orbitControls = controls as OrbitControlsImpl;

    useEffect(() => {
      if (!orbitControls) return;

      // 初始化朝向 myLocation（只执行一次）
      const target = latLongToVector3(myLocation.lat, myLocation.lon, 0);
      orbitControls.target.copy(target);
      orbitControls.update();
    }, []);

    useEffect(() => {
      if (!orbitControls) return;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const target = orbitControls.target.clone();
      const newPos = dir.multiplyScalar(-zoom).add(target);
      camera.position.copy(newPos);
    }, [zoom, camera, orbitControls]);

    return null;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000 * 60); // 每分钟更新一次
    return () => clearInterval(interval);
  }, []);

  const EarthRotation = () => {
    const { clock } = useThree();
    const [rotationY, setRotationY] = useState(0);

    useFrame(() => {
      const elapsed = clock.getElapsedTime();
      const rotation = (elapsed / 86400) * 2 * Math.PI; // 地球自转周期 ≈ 86400秒
      setRotationY(rotation);
    });

    return <Globe myLocation={myLocation} visitorLocation={visitorLocation} isDay={isDay} rotationY={rotationY} />;
  };

  return (
    <div style={{ width: "100%", height: 400, position: "relative" }}>
      <Canvas camera={{ fov: 45 }}>
        <Lighting date={date} />
        <EarthRotation />
        <CameraUpdater zoom={zoom} />
        <OrbitControls
          maxDistance={maxDistance}
          minDistance={minDistance}
          enableZoom={false}
          makeDefault // ✨ 注册 controls 供 useThree().controls 使用
        />
      </Canvas>

      <div style={{ position: "absolute", bottom: 10, width: "100%", textAlign: "center" }}>
        <input
          type="range"
          min={minDistance}
          max={maxDistance}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default GlobeScene;