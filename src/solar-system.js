import { solarBodies, sun } from './planets.js?v=angulo';

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
      this.selected = null;
      this.overview = new THREE.Group();
      this.focus = new THREE.Group();
      this.el.object3D.add(this.overview, this.focus);

      const sphere = new THREE.SphereGeometry(1, 40, 24);
      const loader = new THREE.TextureLoader();
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: '#7f9fbc', transparent: true, opacity: .48, depthWrite: false
      });

      this.bodies = solarBodies.map((body, index) => {
        const pivot = new THREE.Group();
        const axis = new THREE.Group();
        const material = body === sun
          ? new THREE.MeshBasicMaterial({ map: texture(THREE, body, 42) })
          : new THREE.MeshStandardMaterial({ map: texture(THREE, body, index), roughness: .95 });

        const url = new URL('../assets/' + body.image, import.meta.url);
        loader.load(url.href, (map) => {
          map.colorSpace = THREE.SRGBColorSpace;
          material.map.dispose();
          material.map = map;
        }, undefined, () => console.warn('Textura indisponível:', body.name));

        const globe = new THREE.Mesh(sphere, material);
        globe.scale.setScalar(body.radius);
        axis.rotation.z = body === sun ? 0 : body.tilt ?? .22;
        axis.add(globe);
        pivot.add(axis);
        pivot.userData.bodyIndex = index;
        this.overview.add(pivot);
        if (body === sun) return { body, pivot, globe };
        if (body.rings) {
          for (const [inner, outer, color] of [[1.23, 1.50, '#b39568'], [1.55, 1.94, '#dcc39b']]) {
            const ring = new THREE.Mesh(
              new THREE.RingGeometry(inner * body.radius, outer * body.radius, 40),
              new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
            );
            ring.rotation.x = -Math.PI / 2;
            axis.add(ring);
          }
        }

        if (!body.primary) {
          const points = Array.from({ length: 80 }, (_, i) => {
            const angle = i * turn / 80;
            return new THREE.Vector3(Math.cos(angle) * body.orbit, height, Math.sin(angle) * body.orbit);
          });
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          this.overview.add(new THREE.LineLoop(geometry, orbitMaterial));
        }

        return { body, pivot, globe };
      });
      for (const item of this.bodies) {
        if (item.body.primary) {
          item.primaryPivot = this.bodies.find(({ body }) => body.name === item.body.primary).pivot;
        }
      }
      this.ray = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();
      this.projectedCenter = new THREE.Vector3();
      this.updatePositions();
    },

    updatePositions() {
      for (const { body, pivot, globe, primaryPivot } of this.bodies) {
        if (body === sun) {
          pivot.position.set(0, height, 0);
          continue;
        }
        const angle = body.phase + (this.elapsed % body.period) * turn / body.period;
        pivot.position.set(Math.cos(angle) * body.orbit, height, Math.sin(angle) * body.orbit);
        if (primaryPivot) {
          const { x, z } = primaryPivot.position;
          pivot.position.x += x;
          pivot.position.z += z;
        }
        const spinOffset = primaryPivot ? Math.PI - body.phase : 0;
        globe.rotation.y = spinOffset + (this.elapsed % body.spin) * turn / body.spin;
      }
    },

    tick(_time, milliseconds) {
      if (this.selected !== null || !this.el.parentElement.object3D.visible) return;
      this.elapsed += Math.min(milliseconds, 100) / 1000;
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
      while (target && target.userData.bodyIndex === undefined) target = target.parent;
      if (target) return target.userData.bodyIndex;

      // Dá margem ao toque em astros pequenos, como a Lua.
      let nearest = null;
      let nearestDistance = 15;
      for (const { pivot } of this.bodies) {
        const center = pivot.getWorldPosition(this.projectedCenter).project(scene.camera);
        if (Math.abs(center.x) > 1 || Math.abs(center.y) > 1 || Math.abs(center.z) > 1) continue;
        const distance = Math.hypot(
          (center.x - this.pointer.x) * rect.width / 2,
          (center.y - this.pointer.y) * rect.height / 2
        );
        if (distance < nearestDistance) {
          nearest = pivot.userData.bodyIndex;
          nearestDistance = distance;
        }
      }
      return nearest;
    },

    select(index) {
      const { body, pivot } = this.bodies[index];
      this.selected = index;
      this.focus.add(pivot);
      pivot.position.set(0, 1.05, 0);
      pivot.scale.setScalar((body.rings ? .56 : .78) / body.radius);
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
