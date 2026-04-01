import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Earth from './globe/Earth-threejs-journey';
import styles from './AmazingGlobeScene.module.css';

type GlobePoint = {
  lat: number;
  lng: number;
  color: string;
  size?: number;
  name?: string;
};

type GlobeArc = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt?: number;
  color: string;
};

export interface AmazingGlobeSceneProps {
  myLocation: { lat: number; lng: number };
  visitorLocation: { lat: number; lng: number };
  className?: string;
}

type EarthController = {
  update: (delta: number) => void;
  updatePointsData: (points: GlobePoint[]) => void;
  updateArcsData: (arcs: GlobeArc[]) => void;
  rotation: THREE.Euler;
  earthMaterial?: {
    uniforms?: {
      uSunDirection?: { value: THREE.Vector3 };
    };
  };
  atmosphereMaterial?: {
    uniforms?: {
      uSunDirection?: { value: THREE.Vector3 };
    };
  };
  dispose?: () => void;
};

type EarthRuntime = THREE.Object3D & EarthController;

function createGuideRing(radius: number, color: string, opacity: number) {
  return new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.18, 12, 240),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  );
}

function getJulianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function getGreenwichMeanSiderealAngle(date: Date) {
  const julianDay = getJulianDay(date);
  const t = (julianDay - 2451545.0) / 36525.0;
  const gmstDegrees =
    280.46061837 +
    360.98564736629 * (julianDay - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;

  return THREE.MathUtils.degToRad(THREE.MathUtils.euclideanModulo(gmstDegrees, 360));
}

function getEarthRotationY(date: Date) {
  return getGreenwichMeanSiderealAngle(date);
}

function getSunDirection(date: Date) {
  const julianDay = getJulianDay(date);
  const centuries = (julianDay - 2451545.0) / 36525.0;
  const meanLongitude = THREE.MathUtils.euclideanModulo(
    280.46646 + centuries * (36000.76983 + 0.0003032 * centuries),
    360,
  );
  const meanAnomaly =
    357.52911 +
    centuries * (35999.05029 - 0.0001537 * centuries);
  const anomalyRadians = THREE.MathUtils.degToRad(meanAnomaly);
  const equationOfCenter =
    Math.sin(anomalyRadians) *
      (1.914602 - centuries * (0.004817 + 0.000014 * centuries)) +
    Math.sin(2 * anomalyRadians) * (0.019993 - 0.000101 * centuries) +
    Math.sin(3 * anomalyRadians) * 0.000289;
  const trueLongitude = meanLongitude + equationOfCenter;
  const omega = 125.04 - 1934.136 * centuries;
  const apparentLongitude =
    trueLongitude -
    0.00569 -
    0.00478 * Math.sin(THREE.MathUtils.degToRad(omega));
  const meanObliquity =
    23 +
    (26 +
      (21.448 -
        centuries * (46.815 + centuries * (0.00059 - 0.001813 * centuries))) /
        60) /
      60;
  const obliquity =
    meanObliquity +
    0.00256 * Math.cos(THREE.MathUtils.degToRad(omega));
  const apparentLongitudeRadians = THREE.MathUtils.degToRad(apparentLongitude);
  const obliquityRadians = THREE.MathUtils.degToRad(obliquity);

  const equatorialX = Math.cos(apparentLongitudeRadians);
  const equatorialY = Math.cos(obliquityRadians) * Math.sin(apparentLongitudeRadians);
  const equatorialZ = Math.sin(obliquityRadians) * Math.sin(apparentLongitudeRadians);

  return new THREE.Vector3(equatorialX, equatorialZ, -equatorialY).normalize();
}

function buildPoints(myLocation: AmazingGlobeSceneProps['myLocation'], visitorLocation: AmazingGlobeSceneProps['visitorLocation']): GlobePoint[] {
  return [
    {
      lat: myLocation.lat,
      lng: myLocation.lng,
      color: '#58fff3',
      size: 1.7,
      name: 'Kihara',
    },
    {
      lat: visitorLocation.lat,
      lng: visitorLocation.lng,
      color: '#ffd166',
      size: 1.5,
      name: 'Visitor',
    },
  ];
}

function buildArcs(myLocation: AmazingGlobeSceneProps['myLocation'], visitorLocation: AmazingGlobeSceneProps['visitorLocation']): GlobeArc[] {
  return [
    {
      startLat: myLocation.lat,
      startLng: myLocation.lng,
      endLat: visitorLocation.lat,
      endLng: visitorLocation.lng,
      arcAlt: 0.24,
      color: '#7df9ff',
    },
  ];
}

const AmazingGlobeScene: React.FC<AmazingGlobeSceneProps> = ({ myLocation, visitorLocation, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const earthRef = useRef<EarthRuntime | null>(null);
  const meLabelRef = useRef<HTMLDivElement | null>(null);
  const youLabelRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const pointsData = useMemo(() => buildPoints(myLocation, visitorLocation), [myLocation, visitorLocation]);
  const arcsData = useMemo(() => buildArcs(myLocation, visitorLocation), [myLocation, visitorLocation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setLoaded(false);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 1600);
    camera.position.set(-120, 86, -300);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.className = styles.canvas;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    resize();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 180;
    controls.maxDistance = 420;
    controls.rotateSpeed = 0.45;
    controls.target.set(0, 6, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
    const sunLight = new THREE.DirectionalLight(0xffffff, 4.8);
    scene.add(ambientLight, sunLight);

    const envLoader = new RGBELoader();
    let envTexture: THREE.DataTexture | null = null;
    envLoader.load('/amazing-globe/texture/royal_esplanade_1k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 1;
      envTexture = texture;
    });

    const earth = new Earth(
      {
        radius: 100,
        segments: 64,
        showAtmosphere: true,
        polygonColor: '#7df9ff',
        polygonOpacity: 0.12,
        pointSize: 0.75,
        autoRotate: false,
        autoRotateSpeed: 0,
        arcTime: 2200,
        flyingLineLength: 26,
        showFlyingParticle: true,
        particleSize: 0.9,
        waveCount: 4,
        waveDuration: 2.4,
        waveDelay: 460,
        maxRings: 1.3,
        baseCircleScale: 1,
        ringThickness: 0.05,
        arcsData,
        pointsData,
        atmosphereDayColor: '#49d8ff',
        atmosphereTwilightColor: '#ff9966',
        showLandPoints: false,
        showFlightRoutes: false,
      },
      () => setLoaded(true),
    ) as unknown as EarthRuntime;
    earthRef.current = earth;

    const equatorRing = createGuideRing(101.4, '#6fdfff', 0.14);
    equatorRing.rotation.x = Math.PI / 2;
    earth.add(equatorRing);

    const meridianRing = createGuideRing(101.7, '#9ec6ff', 0.1);
    meridianRing.rotation.z = Math.PI / 2;
    earth.add(meridianRing);

    scene.add(earth);

    const clock = new THREE.Clock();
    let frameId = 0;

    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lng + 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    const setInitialView = (date: Date) => {
      const earthRotationY = getEarthRotationY(date);
      earth.rotation.y = earthRotationY;
      earth.updateMatrixWorld(true);

      const visitorSurface = earth.localToWorld(latLngToVector3(
        visitorLocation.lat,
        visitorLocation.lng,
        104,
      ).clone());
      const visitorDirection = visitorSurface.clone().normalize();
      const offsetDirection = visitorDirection
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(-18))
        .clone()
        .lerp(new THREE.Vector3(0, 0.22, 0), 0.1)
        .normalize();
      const target = visitorSurface.clone().multiplyScalar(0.09);

      camera.position.copy(offsetDirection.multiplyScalar(338));
      camera.lookAt(target);
      controls.target.copy(target);
      controls.update();
    };

    const updateLabelPosition = (
      label: HTMLDivElement | null,
      point: { lat: number; lng: number },
      yOffset: number,
    ) => {
      if (!label) return;

      earth.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);

      const localPosition = latLngToVector3(point.lat, point.lng, 104);
      const worldPosition = earth.localToWorld(localPosition.clone());
      const projected = worldPosition.clone().project(camera);
      const hidden = projected.z > 1 || projected.z < -1;
      const earthCenter = earth.getWorldPosition(new THREE.Vector3());
      const surfaceNormal = worldPosition.clone().sub(earthCenter).normalize();
      const cameraDirection = camera.position.clone().sub(worldPosition).normalize();
      const isBehindEarth = surfaceNormal.dot(cameraDirection) <= 0;

      if (hidden || isBehindEarth) {
        label.style.opacity = '0';
        return;
      }

      const x = (projected.x * 0.5 + 0.5) * container.clientWidth;
      const y = (-projected.y * 0.5 + 0.5) * container.clientHeight;

      label.style.opacity = '1';
      label.style.transform = `translate(${x}px, ${y + yOffset}px) translate(-50%, -50%)`;
    };

    const render = () => {
      const delta = clock.getDelta();
      const now = new Date();
      const sunDirection = getSunDirection(now);
      const earthRotationY = getEarthRotationY(now);

      earth.rotation.y = earthRotationY;
      earth.earthMaterial?.uniforms?.uSunDirection?.value.copy(sunDirection);
      earth.atmosphereMaterial?.uniforms?.uSunDirection?.value.copy(sunDirection);
      sunLight.position.copy(sunDirection).multiplyScalar(420);

      controls.update();
      earth.update(delta);
      updateLabelPosition(meLabelRef.current, myLocation, -18);
      updateLabelPosition(youLabelRef.current, visitorLocation, -20);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    setInitialView(new Date());
    render();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
      controls.dispose();
      earth.dispose?.();
      envTexture?.dispose();
      scene.clear();
      renderer.dispose();
      renderer.domElement.remove();
      earthRef.current = null;
    };
  }, [arcsData, myLocation, pointsData, visitorLocation]);

  return (
    <div ref={containerRef} className={[styles.scene, className ?? ''].join(' ').trim()}>
      <div ref={meLabelRef} className={[styles.pinLabel, styles.pinLabelHome].join(' ').trim()}>ME</div>
      <div ref={youLabelRef} className={[styles.pinLabel, styles.pinLabelVisitor].join(' ').trim()}>YOU ARE HERE</div>
      <div className={[styles.loading, loaded ? styles.loaded : ''].join(' ').trim()}>
        Loading Globe
      </div>
    </div>
  );
};

export default AmazingGlobeScene;
