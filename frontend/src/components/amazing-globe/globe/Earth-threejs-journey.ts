// @ts-nocheck
import * as THREE from 'three';
import EarthGithub from './Earth-github';
import earthFragmentShader from './shader/threejs-journey-earth/earth/fragment.glsl';
import earthVertexShader from './shader/threejs-journey-earth/earth/vertex.glsl';
import atmosphereFragmentShader from './shader/threejs-journey-earth/atmosphere/fragment.glsl';
import atmosphereVertexShader from './shader/threejs-journey-earth/atmosphere/vertex.glsl';

const textureLoader = new THREE.TextureLoader();
textureLoader.setPath('/amazing-globe/texture/earth/');

export default class Earth extends EarthGithub {
    constructor(config = {}, onLoad = () => {}) {
        super({
            showLandPoints: false,
            showFlightRoutes: false,
            ...config
        }, () => {});

        this.hasLoaded = false;
        this.onLoad = () => {
            if (!this.hasLoaded) {
                onLoad();
                this.hasLoaded = true;
            }
        };

        if (this.loadedTextureCount >= this.expectedTextureCount) {
            this.onLoad();
        }
    }

    createEarth() {
        this.expectedTextureCount = 3;
        this.loadedTextureCount = 0;

        const checkTextureLoaded = () => {
            this.loadedTextureCount += 1;
            if (this.loadedTextureCount >= this.expectedTextureCount) {
                this.onLoad();
            }
        };

        const earthDayTexture = textureLoader.load('day.jpg', checkTextureLoaded);
        earthDayTexture.colorSpace = THREE.SRGBColorSpace;
        earthDayTexture.anisotropy = 8;

        const earthNightTexture = textureLoader.load('night.jpg', checkTextureLoaded);
        earthNightTexture.colorSpace = THREE.SRGBColorSpace;
        earthNightTexture.anisotropy = 8;

        const earthSpecularCloudsTexture = textureLoader.load('specularClouds.jpg', checkTextureLoaded);
        earthSpecularCloudsTexture.anisotropy = 8;

        this.earthGeometry = new THREE.SphereGeometry(this.radius, this.segments, this.segments);
        this.earthMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uDayTexture: new THREE.Uniform(earthDayTexture),
                uNightTexture: new THREE.Uniform(earthNightTexture),
                uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
                uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(this.config.atmosphereDayColor ?? '#00aaff')),
                uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(this.config.atmosphereTwilightColor ?? '#ff6600'))
            },
            vertexShader: earthVertexShader,
            fragmentShader: earthFragmentShader,
        });

        this.earthMesh = new THREE.Mesh(this.earthGeometry, this.earthMaterial);
        this.add(this.earthMesh);
    }

    createAtmosphere() {
        this.atmosphereMaterial = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            transparent: true,
            uniforms: {
                uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(this.config.atmosphereDayColor ?? '#00aaff')),
                uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(this.config.atmosphereTwilightColor ?? '#ff6600'))
            },
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
        });

        this.atmosphere = new THREE.Mesh(this.earthGeometry, this.atmosphereMaterial);
        this.atmosphere.scale.set(1.04, 1.04, 1.04);
        this.add(this.atmosphere);
    }

    update(delta) {
        super.update(delta);
    }
}
