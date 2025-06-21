export function getSunPosition(date: Date): [number, number, number] {
  console.log("当前时间: ", date)
  const EARTH_RADIUS = 100;
  const AXIAL_TILT = 23.44;

  const jd = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000 + 2451545.0;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;
  const lambdaSun = (L + 1.915 * Math.sin(g * Math.PI / 180) + 0.02 * Math.sin(2 * g * Math.PI / 180)) % 360;

  const epsilon = AXIAL_TILT * Math.PI / 180;
  const lambdaRad = lambdaSun * Math.PI / 180;

  const x = Math.cos(lambdaRad);
  const y = Math.cos(epsilon) * Math.sin(lambdaRad);
  const z = Math.sin(epsilon) * Math.sin(lambdaRad);

  return [x * EARTH_RADIUS, y * EARTH_RADIUS, z * EARTH_RADIUS];
}
