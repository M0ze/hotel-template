/**
 * Joyce Hotel Mubende — Three.js ambient 3D scene
 *
 * A slow, ambient environment:
 *  - a subtle floating geometric "hotel" cluster with gentle rotation
 *  - a drifting point-particle network
 *  - a soft glow ring
 *
 * Orbit with the mouse; press D to toggle controls + stats overlay.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Stats } from 'three/addons/aids/Stats.js';

const stage = document.getElementById('stage');
const overlay = document.getElementById('overlay');

/* --- Canvas sizing --- */
const SIZE = window.innerWidth < 720 ? 640 : 900;
stage.style.width = `${SIZE}px`;
stage.style.height = `${SIZE}px`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0e1a);

/* --- Camera --- */
const camera = new THREE.PerspectiveCamera(45, SIZE / SIZE, 0.1, 1000);
camera.position.set(0, 0.8, 4.5);

/* --- Renderer --- */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(SIZE, SIZE);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
stage.appendChild(renderer.domElement);

/* --- Controls --- */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2;
controls.maxDistance = 10;
controls.autoRotate = false;
controls.target.set(0, 0.4, 0);

/* --- Stats (toggle with `D`) --- */
const stats = new Stats();
stats.dom.style.position = 'absolute';
stats.dom.style.bottom = '16px';
stats.dom.style.right = '16px';
stats.dom.style.zIndex = '10';
stats.dom.style.pointerEvents = 'none';
stats.dom.style.display = 'none';
if (stage) stage.appendChild(stats.dom);

/* --- Ambient light --- */
const ambient = new THREE.AmbientLight(0x446688, 0.55);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffeedd, 1.3);
keyLight.position.set(2.5, 4, 3);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
const d = 2.4;
keyLight.shadow.camera.left = -d; keyLight.shadow.camera.right = d;
keyLight.shadow.camera.top = d; keyLight.shadow.camera.bottom = -d;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 8;
scene.add(keyLight);

const fill = new THREE.DirectionalLight(0x4488ff, 0.45);
fill.position.set(-2.5, 1.5, -3);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xf2b632, 0.55);
rim.position.set(0, -1, 4);
scene.add(rim);

const ambientBlu = new THREE.AmbientLight(0x4466ff, 0.18);
scene.add(ambientBlu);

/* --- Ground grid (faint) --- */
const gridHelper = new THREE.GridHelper(6, 24, 0xf2b632, 0x334466);
gridHelper.position.y = -0.4;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.08;
scene.add(gridHelper);

/* --- Hotel group --- */
const building = new THREE.Group();
building.position.y = -0.4;
scene.add(building);

// Main tower
const towerGeo = new THREE.BoxGeometry(1.6, 2.4, 1.2);
const towerMat = new THREE.MeshStandardMaterial({
  color: 0x111c3a,
  roughness: 0.35,
  metalness: 0.7,
  emissive: 0x111133,
  emissiveIntensity: 0.2,
});
const tower = new THREE.Mesh(towerGeo, towerMat);
tower.castShadow = true;
tower.receiveShadow = true;
building.add(tower);

// Top crown / spire
const spireGeo = new THREE.ConeGeometry(0.5, 1.2, 32);
const spireMat = new THREE.MeshStandardMaterial({
  color: 0x0a1025,
  roughness: 0.3,
  metalness: 0.8,
  emissive: 0xf2b632,
  emissiveIntensity: 0.08,
});
const spire = new THREE.Mesh(spireGeo, spireMat);
spire.position.y = 1.6;
spire.castShadow = true;
building.add(spire);

// Supporting decorative cubes (accents)
const accentColors = [0xf2b632, 0x3d7aff, 0x00f9a8];
const accGroup = new THREE.Group();
const accSize = 0.28;
for (let i = 0; i < 12; i++) {
  const g = new THREE.BoxGeometry(accSize, accSize, accSize);
  const m = new THREE.MeshStandardMaterial({
    color: accentColors[i % accentColors.length],
    emissive: accentColors[i % accentColors.length],
    emissiveIntensity: 0.15,
    roughness: 0.25,
    metalness: 0.5,
  });
  const mesh = new THREE.Mesh(g, m);
  const angle = (i / 12) * Math.PI * 2;
  const r = 0.62 + (i % 3) * 0.18;
  mesh.position.set(
    Math.cos(angle) * r,
    0.5 + (i % 2) * 0.35,
    Math.sin(angle) * r
  );
  mesh.castShadow = true;
  mesh.rotation.set(
    Math.random() * 0.3,
    Math.random() * Math.PI * 2,
    Math.random() * 0.3
  );
  accGroup.add(mesh);
  // tiny point light at each accent
  const pl = new THREE.PointLight(accentColors[i % accentColors.length], 0.12, 1.4);
  pl.position.copy(mesh.position);
  pl.position.y += 0.3;
  building.add(pl);
}
building.add(accGroup);

// Glow ring around the building
const ringGeo = new THREE.TorusGeometry(1.05, 0.018, 24, 64);
const ringMat = new THREE.MeshStandardMaterial({
  color: 0xf2b632,
  emissive: 0xf2b632,
  emissiveIntensity: 0.15,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2;
ring.position.y = 1.7;
building.add(ring);

/* --- Particles (ambient network) --- */
const particleCount = 600;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
const pSizes = new Float32Array(particleCount);
const pSpeeds = new Float32Array(particleCount);
const pOffsets = new Float32Array(particleCount);
const pColors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const radius = 1.6 + Math.random() * 3.2;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  pPos[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
  pPos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  pSizes[i] = 0.02 + Math.random() * 0.04;
  pSpeeds[i] = 0.08 + Math.random() * 0.16;
  pOffsets[i] = Math.random() * Math.PI * 2;
  const c = new THREE.Color().setHSL(0.12 + Math.random() * 0.10, 0.75, 0.5 + Math.random() * 0.3);
  pColors[i * 3] = c.r;
  pColors[i * 3 + 1] = c.g;
  pColors[i * 3 + 2] = c.b;
}

pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));
pGeo.setAttribute('aSpeed', new THREE.BufferAttribute(pSpeeds, 1));
pGeo.setAttribute('aOffset', new THREE.BufferAttribute(pOffsets, 1));
pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

const pMat = new THREE.PointsMaterial({
  size: 0.04,
  vertexColors: true,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* --- Animation loop --- */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // rotate tower slowly
  tower.rotation.y = t * 0.08;
  spire.rotation.y = t * 0.12;
  accGroup.rotation.y = t * 0.06;

  // pulse accents + ring
  const pulse = 0.6 + 0.4 * Math.sin(t * 0.4);
  accGroup.children.forEach((m, i) => {
    m.scale.setScalar(0.92 + 0.16 * Math.sin(t * 1.2 + i * 0.5));
  });
  ring.material.emissiveIntensity = 0.1 + 0.15 * Math.sin(t * 0.3 + 1);
  spire.material.emissiveIntensity = 0.06 + 0.05 * Math.sin(t * 0.5 + 0.5);

  // particles drift + rotate
  const pos = particles.geometry.attributes.position.array;
  const speeds = particles.geometry.attributes.aSpeed.array;
  const offsets = particles.geometry.attributes.aOffset.array;
  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    pos[idx + 1] += Math.sin(t * speeds[i] + offsets[i]) * 0.002 * speeds[i];
    pos[idx] += Math.cos(t * speeds[i] + offsets[i]) * 0.001 * speeds[i];
    pos[idx + 2] += Math.sin(t * speeds[i] * 0.7 + offsets[i]) * 0.001 * speeds[i];

    const r = Math.sqrt(pos[idx] * pos[idx] + pos[idx + 2] * pos[idx + 2]);
    const maxR = 1.6 + 3.2;
    if (r > maxR) {
      const ang = Math.atan2(pos[idx + 2], pos[idx]);
      pos[idx] = Math.cos(ang) * maxR;
      pos[idx + 2] = Math.sin(ang) * maxR;
    }
    if (pos[idx + 1] > 1.2) pos[idx + 1] = -1.2;
  }
  particles.geometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);

  if (stats && stats.dom.style.display !== 'none') stats.update();
}

/* --- Resize --- */
function onResize() {
  const w = window.innerWidth < 720 ? 640 : 900;
  const h = w;
  stage.style.width = `${w}px`;
  stage.style.height = `${h}px`;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

/* --- Keyboard: toggle controls / stats (D) --- */
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'd') {
    e.preventDefault();
    const display = stats.dom.style.display === 'none' ? 'block' : 'none';
    stats.dom.style.display = display;
  }
});

animate();

console.log('✨ Joyce Hotel Mubende 3D scene ready. Orbit with mouse, toggle with D.');
