import { solarBodies, sun } from './planets.js?v=lua';

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

      const sphere = new THREE.SphereGeometry(1, 40, 24);
      const loader = new THREE.TextureLoader();

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
        if (body === sun) return { body, pivot, axis, globe };
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

        const points = Array.from({ length: 80 }, (_, i) => {
          const angle = i * turn / 80;
          return new THREE.Vector3(Math.cos(angle) * body.orbit, height, Math.sin(angle) * body.orbit);
        });
        const orbit = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: '#7f9fbc', transparent: true, opacity: .48, depthWrite: false })
        );
        this.overview.add(orbit);
        return { body, pivot, axis, globe, orbit };
      });
      for (const item of this.bodies) {
        if (item.body.primary) {
          item.primaryPivot = this.bodies.find(({ body }) => body.name === item.body.primary).pivot;
        }
      }
      this.ray = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();
      this.focusView = {
        cameraPosition: new THREE.Vector3(),
        pivotPosition: new THREE.Vector3(),
        up: new THREE.Vector3(),
        cameraRotation: new THREE.Quaternion(),
        worldRotation: new THREE.Quaternion(),
        lookAt: new THREE.Matrix4()
      };
      this.updatePositions();
    },

    updatePositions() {
      for (const { body, pivot, globe, orbit, primaryPivot } of this.bodies) {
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
          orbit.position.set(x, 0, z);
        }
        const spinOffset = primaryPivot ? Math.PI - body.phase : 0;
        globe.rotation.y = spinOffset + (this.elapsed % body.spin) * turn / body.spin;
      }
    },

    tick(_time, milliseconds) {
      if (!this.el.parentElement.object3D.visible) return;
      if (this.selected !== null) {
        this.faceCamera();
        return;
      }
      if (this.paused) return;
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
      while (target && target.userData.bodyIndex === undefined) target = target.parent;
      return target?.userData.bodyIndex ?? null;
    },

    select(index) {
      const { body, pivot, axis, globe } = this.bodies[index];
      this.selected = index;
      this.focus.add(pivot);
      pivot.position.set(0, 1.05, 0);
      pivot.scale.setScalar((body.rings ? .56 : .78) / body.radius);
      const [latitude, longitude] = body.focus;
      // No mapeamento da esfera, o meridiano de -90° aponta para +Z.
      axis.rotation.set(THREE.MathUtils.degToRad(latitude), THREE.MathUtils.degToRad(-90 - longitude), 0);
      globe.rotation.y = 0;
      this.overview.visible = false;
      this.faceCamera();
    },

    faceCamera() {
      const camera = this.el.sceneEl.camera;
      if (!camera) return;
      const { pivot } = this.bodies[this.selected];
      const { cameraPosition, pivotPosition, up, cameraRotation, worldRotation, lookAt } = this.focusView;
      camera.getWorldPosition(cameraPosition);
      camera.getWorldQuaternion(cameraRotation);
      pivot.getWorldPosition(pivotPosition);
      up.set(0, 1, 0).applyQuaternion(cameraRotation);
      lookAt.lookAt(cameraPosition, pivotPosition, up);
      worldRotation.setFromRotationMatrix(lookAt);
      this.focus.getWorldQuaternion(pivot.quaternion).invert().multiply(worldRotation);
    },

    showOverview() {
      const { body, pivot, axis } = this.bodies[this.selected];
      this.overview.add(pivot);
      pivot.quaternion.identity();
      axis.rotation.set(0, 0, body === sun ? 0 : body.tilt ?? .22);
      pivot.scale.setScalar(1);
      this.selected = null;
      this.updatePositions();
      this.overview.visible = true;
    }
  });
}
