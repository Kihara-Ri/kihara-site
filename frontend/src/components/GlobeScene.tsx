import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./Globe-widget/Globe";
import Lighting from "./Globe-widget/Lightning";
import * as THREE from "three";

interface GlobeSceneProps {
  myLocation: { lat: number; lon: number };
  visitorLocation: { lat: number; lon: number };
  isDay: boolean;
}

const GlobeScene: React.FC<GlobeSceneProps> = ({ myLocation, visitorLocation, isDay }) => {
  const [date, setDate] = useState(new Date());
  const maxDistance = 8.0;
  const minDistance = 3.0;
  const [zoom, setZoom] = useState(maxDistance);
  const controlsRef = useRef<any>(null);
  const cameraInitRef = useRef(false);

  const latLongToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  };

  const CameraUpdater = ({ zoom }: { zoom: number }) => {
    const { camera, gl } = useThree();
    useFrame(() => {
      if (!controlsRef.current) return;

      if (!cameraInitRef.current) {
        // 第一次加载时将 myLocation 朝向相机
        const dir = latLongToVector3(myLocation.lat, myLocation.lon, 1).normalize();
        camera.position.copy(dir.multiplyScalar(zoom));
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
        cameraInitRef.current = true;
      }

      // 缩放逻辑：保持朝向不变，只更新距离
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const target = controlsRef.current.target;
      const newPos = dir.multiplyScalar(-zoom).add(target);
      camera.position.copy(newPos);
      controlsRef.current.update();
    });
    return null;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const EarthRotation = () => {
    const { clock } = useThree();
    const [rotationY, setRotationY] = useState(0);

    useFrame(() => {
      const elapsed = clock.getElapsedTime();
      const rotation = (elapsed / 86400) * 2 * Math.PI;
      setRotationY(rotation);
    });

    return <Globe myLocation={myLocation} visitorLocation={visitorLocation} isDay={isDay} rotationY={rotationY} />;
  };

  return (
    <div style={{ width: "100%", height: 400, position: "relative"}}>
      <Canvas camera={{ position: [0, 0, maxDistance], fov: 45 }}>
        <Lighting date={date} />
        <EarthRotation />
        <CameraUpdater zoom={zoom} />
        <OrbitControls ref={controlsRef} maxDistance={maxDistance} minDistance={minDistance} enableZoom={false} />
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