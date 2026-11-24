import { planets } from './planets.js';

const turn = Math.PI * 2;
const height = .46;

function texture(THREE, build, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const [base, dark, light] = build.colors;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 130; i++) {
    ctx.globalAlpha = .12 + random() * .25;
    ctx.fillStyle = i % 2 ? dark : light;
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const rx = build.bands ? 28 + random() * 115 : 2 + random() * 14;
    const ry = build.bands ? .8 + random() * 3 : 1 + random() * 10;
    for (const offset of [-canvas.width, 0, canvas.width]) {
      ctx.beginPath();
      ctx.ellipse(x + offset, y, rx, ry, 0, 0, turn);
      ctx.fill();
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

export function registerSolarSystem(AFRAME) {
  const { THREE } = AFRAME;
  AFRAME.registerComponent('solar-system', {
    init() {
      this.elapsed = 0;
      this.paused = false;
      this.speed = 1;
      this.selected = null;
      this.overview = new THREE.Group();
      this.focus = new THREE.Group();
      this.el.object3D.add(this.overview, this.focus);

      const sphere = new THREE.SphereGeometry(1, 24, 16);
      const sun = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
        map: texture(THREE, { colors: ['#ffae36', '#ed641f', '#fff2a6'] }, 42)
      }));
      sun.scale.setScalar(.38);
      sun.position.y = height;
      this.overview.add(sun);

      this.bodies = planets.map((planet, index) => {
        const pivot = new THREE.Group();
        const axis = new THREE.Group();
        const globe = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({
          map: texture(THREE, planet, index + 1), roughness: .95
        }));
        globe.scale.setScalar(planet.radius);
        axis.rotation.z = planet.tilt ?? .22;
        axis.add(globe);
        pivot.add(axis);
        pivot.userData.planetIndex = index;

        if (planet.rings) {
          for (const [inner, outer, color] of [[1.23, 1.50, '#b39568'], [1.55, 1.94, '#dcc39b']]) {
            const ring = new THREE.Mesh(
              new THREE.RingGeometry(inner * planet.radius, outer * planet.radius, 40),
              new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
            );
            ring.rotation.x = -Math.PI / 2;
            axis.add(ring);
          }
        }

        const points = Array.from({ length: 80 }, (_, i) => {
          const angle = i * turn / 80;
          return new THREE.Vector3(Math.cos(angle) * planet.orbit, height, Math.sin(angle) * planet.orbit);
        });
        const orbit = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: '#7f9fbc', transparent: true, opacity: .48, depthWrite: false })
        );
        this.overview.add(orbit, pivot);
        return { planet, pivot, globe };
      });
      this.ray = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();
      this.updatePositions();
    },

    updatePositions() {
      for (const { planet, pivot, globe } of this.bodies) {
        const angle = planet.phase + (this.elapsed % planet.period) * turn / planet.period;
        pivot.position.set(Math.cos(angle) * planet.orbit, height, Math.sin(angle) * planet.orbit);
        globe.rotation.y = (this.elapsed % planet.spin) * turn / planet.spin;
      }
    },

    tick(_time, milliseconds) {
      if (this.paused || this.selected !== null || !this.el.parentElement.object3D.visible) return;
      this.elapsed += Math.min(milliseconds, 100) / 1000 * this.speed;
      this.updatePositions();
    },

    pick(event) {
      const scene = this.el.sceneEl;
      if (this.selected !== null || !this.el.parentElement.object3D.visible || !scene.camera) return null;
      const rect = scene.canvas.getBoundingClientRect();
      this.pointer.set(
        (event.clientX - rect.left) / rect.width * 2 - 1,
        1 - (event.clientY - rect.top) / rect.height * 2
      );
      scene.object3D.updateMatrixWorld(true);
      this.ray.setFromCamera(this.pointer, scene.camera);
      const hit = this.ray.intersectObjects(this.bodies.map(({ pivot }) => pivot), true)[0];
      let target = hit?.object;
      while (target && target.userData.planetIndex === undefined) target = target.parent;
      return target?.userData.planetIndex ?? null;
    },

    select(index) {
      const { planet, pivot } = this.bodies[index];
      this.selected = index;
      this.focus.add(pivot);
      pivot.position.set(0, 1.05, 0);
      pivot.scale.setScalar((planet.rings ? .56 : .78) / planet.radius);
      this.overview.visible = false;
    },

    showOverview() {
      const { pivot } = this.bodies[this.selected];
      this.overview.add(pivot);
      pivot.scale.setScalar(1);
      this.selected = null;
      this.updatePositions();
      this.overview.visible = true;
    }
  });
}
