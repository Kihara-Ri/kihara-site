import * as THREE from "three";

export const latLongToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};

export const createGreatCircleArc = (start: THREE.Vector3, end: THREE.Vector3, segments = 64): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const interpolated = new THREE.Vector3().copy(start).normalize().lerp(end.clone().normalize(), t).normalize();
    interpolated.multiplyScalar(start.length());
    points.push(interpolated);
  }
  return points;
};
