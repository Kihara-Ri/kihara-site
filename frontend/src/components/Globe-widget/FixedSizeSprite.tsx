// FixedSizeSprite.tsx
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import React, { useRef } from "react";

interface FixedSizeSpriteProps {
  texture: THREE.Texture;
  position: THREE.Vector3;
  size?: number; // 屏幕大小（如 0.2 表示固定视觉尺寸）
}

const FixedSizeSprite: React.FC<FixedSizeSpriteProps> = ({ texture, position, size = 0.2 }) => {
  const spriteRef = useRef<THREE.Sprite>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (spriteRef.current) {
      const distance = camera.position.distanceTo(position);
      const scaleFactor = distance * size;
      spriteRef.current.scale.set(scaleFactor, scaleFactor, 1);
    }
  });

  return (
    <sprite ref={spriteRef} position={position}>
      <spriteMaterial
        map={texture}
        // transparent
        depthWrite={true} // 保证写入深度缓冲
        depthTest={false} // 被遮挡时正确遮挡
        // 图标的展示仍不满意，希望做到检测图标是否被遮挡，如果被遮挡，增加图标的透明度以提示用户
        />
    </sprite>
  );
};

export default FixedSizeSprite;
