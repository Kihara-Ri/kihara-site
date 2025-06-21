import * as THREE from "three";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { latLongToVector3, createGreatCircleArc } from "../../utils/geo";

interface AnimatedArcProps {
  from: { lat: number; lon: number };
  to: { lat: number; lon: number };
  radius?: number;
}

const AnimatedArc: React.FC<AnimatedArcProps> = ({ from, to, radius = 2.02 }) => {
  const arcPoints = useMemo(() => {
    const p1 = latLongToVector3(from.lat, from.lon, radius);
    const p2 = latLongToVector3(to.lat, to.lon, radius);
    return createGreatCircleArc(p1, p2, 100);
  }, [from, to, radius]);

  const geometry = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPoints), 100, 0.015, 8, false), [arcPoints]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
        }}
        vertexShader={`
          varying float vProgress;

          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vProgress = position.y; // 可按需要调整为长度比例
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying float vProgress;

          void main() {
            float speed = 5.0;
            // 频率
            float wave = sin(vProgress * 10.0 - uTime * speed) * 0.5 + 0.5;
            float alpha = smoothstep(0.2, 1.0, wave);
            vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(0.7, 0.9, 1.0), wave);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
};

export default AnimatedArc;
