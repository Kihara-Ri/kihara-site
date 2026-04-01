# Amazing Globe Component

## Overview

`AmazingGlobeScene` is the homepage globe component used to visualize the relationship between the site owner and the current visitor.

It is not a generic npm package wrapper. It is a project-local React + Three.js integration built on top of the `amazing-globe` source that has been adapted for this site.

File entry:

- `frontend/src/components/amazing-globe/AmazingGlobeScene.tsx`

## Features

- Real-time Earth rotation driven by sidereal time
- Real-time solar lighting direction
- Transparent canvas that blends into the hero section
- Owner point and visitor point on the globe
- Great-circle arc between owner and visitor
- Surface labels for `ME` and `YOU ARE HERE`
- Initial camera framing biased toward the visitor location
- Reusable React component interface

## Public API

```tsx
<AmazingGlobeScene
  myLocation={{ lat: 35.70798, lng: 139.84298 }}
  visitorLocation={{ lat: 37.38605, lng: -122.08385 }}
/>
```

Props:

- `myLocation`: fixed site-owner location in latitude/longitude
- `visitorLocation`: current visitor location in latitude/longitude
- `className`: optional wrapper class

## Rendering Architecture

`AmazingGlobeScene.tsx` sets up:

- a Three.js `Scene`
- a perspective `Camera`
- a transparent `WebGLRenderer`
- `OrbitControls`
- a low-intensity ambient light
- a directional light driven by the current solar direction
- an HDR environment map
- the customized `Earth` object from `Earth-threejs-journey`

The underlying Earth implementation lives in:

- `frontend/src/components/amazing-globe/globe/Earth-threejs-journey.ts`
- `frontend/src/components/amazing-globe/globe/Earth-github.ts`

## Time And Lighting

The globe does not use a fake auto-rotate animation.

Instead it computes:

- Julian Day
- Greenwich Mean Sidereal Time
- solar apparent longitude
- Earth obliquity
- sun direction in world space

This is used to:

- rotate the Earth mesh to its current orientation
- update the shader uniform `uSunDirection`
- align the scene directional light with the same sun vector

Relevant functions:

- `getJulianDay`
- `getGreenwichMeanSiderealAngle`
- `getEarthRotationY`
- `getSunDirection`

## Geographic Mapping

Latitude/longitude is mapped onto the sphere with:

```ts
phi = degToRad(90 - lat)
theta = degToRad(lng + 180)
```

Then converted into the model coordinate system:

```ts
x = -(r * sin(phi) * cos(theta))
y = r * cos(phi)
z = r * sin(phi) * sin(theta)
```

This mapping is used for:

- visitor point placement
- owner point placement
- arc endpoints
- projected screen-space label anchors

## Camera Behavior

On mount, the component computes a visitor-biased initial camera direction.

Design intent:

- the visitor location should be close to center
- the camera should not face the visitor point perfectly head-on
- the globe should still retain volume and side curvature

Implementation:

- find the visitor surface direction on the rotated Earth
- apply a small horizontal bias
- add a small vertical lift
- set the camera target slightly inside the surface point instead of exactly on it

This produces a framed shot rather than a flat front view.

## Label Projection

The labels `ME` and `YOU ARE HERE` are DOM overlays, not Three.js text meshes.

Why:

- simpler typography control
- cheaper to render
- easier hover/opacity behavior

How it works:

1. Convert lat/lng to local sphere coordinates.
2. Convert local point to world position with `earth.localToWorld(...)`.
3. Project world position with `project(camera)`.
4. Convert normalized device coordinates to pixel coordinates.
5. Hide the label if the surface normal faces away from the camera.

## Home Integration

The homepage passes live visitor coordinates into the globe after `/api/ipinfo` resolves.

Related files:

- `frontend/src/pages/Home.tsx`
- `frontend/src/config/site.ts`

The text surrounding the globe is intentionally separated from the globe implementation. The globe component only handles 3D visualization and labels.

## Styling

The component stylesheet is:

- `frontend/src/components/amazing-globe/AmazingGlobeScene.module.css`

It defines:

- transparent scene container
- loading overlay
- projected label appearance

The component assumes it is placed inside a controlled layout box and will fill that box.

## Assets

Textures and decoder assets are loaded from:

- `frontend/public/amazing-globe/texture/...`
- `frontend/public/amazing-globe/draco/...`

These are required at runtime.

## Extension Points

If you want to modify behavior, the safest places are:

- `buildPoints(...)`: change visible markers
- `buildArcs(...)`: change connection behavior
- `setInitialView(...)`: tune first-frame framing
- `updateLabelPosition(...)`: tune label visibility or placement
- shader files under `globe/shader/...`: adjust atmosphere, twilight, or surface look

## Known Tradeoffs

- The globe uses a large JS bundle because Three.js, HDR assets, and local engine code are loaded into the homepage chunk.
- Label projection uses DOM overlays, so labels are visually cleaner but are not occluded by fine geometry beyond the sphere-facing test.
- Solar lighting is physically motivated, but still tuned for visual readability rather than scientific visualization.
