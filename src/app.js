import { solarBodies } from './planets.js';
import { registerSolarSystem } from './solar-system.js';

const params = new URLSearchParams(location.search);
const ar = params.get('modo') === 'ra';
const mvp = params.get('etapa') === 'mvp';
const arLibrary = 'https://raw.githack.com/AR-js-org/AR.js/3.4.7/aframe/build/aframe-ar.js';

const stage = document.querySelector('#stage');
const status = document.querySelector('#status');

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

async function start() {
  const link = document.querySelector(ar ? '#ar-link' : '#preview-link');
  link.setAttribute('aria-current', 'page');
  if (mvp) {
    document.querySelector('#ar-link').href = './?modo=ra&etapa=mvp';
    document.querySelector('#preview-link').href = './?etapa=mvp';
  }
  if (!window.AFRAME) throw new Error('O A-Frame não carregou. Confira a conexão e recarregue.');
  if (ar && !window.isSecureContext) throw new Error('Abra esta página em HTTPS para usar a câmera.');
  if (ar && !navigator.mediaDevices?.getUserMedia) throw new Error('A câmera não está disponível neste navegador.');

  const scene = document.createElement('a-scene');
  scene.setAttribute('embedded', '');
  scene.setAttribute('vr-mode-ui', 'enabled: false');
  scene.setAttribute('xr-mode-ui', 'enabled: false');
  scene.setAttribute('renderer', 'alpha: true; antialias: true; maxCanvasWidth: 1280; maxCanvasHeight: 1280');
  scene.setAttribute('loading-screen', 'enabled: false');

  const camera = document.createElement('a-entity');
  camera.setAttribute('camera', 'fov: 50; near: 0.02; far: 60');
  scene.append(camera);

  let anchor = document.createElement('a-entity');
  if (ar) {
    try {
      await loadScript(arLibrary);
    } catch {
      throw new Error('O AR.js não carregou. Confira a conexão e recarregue.');
    }
    // AR.js cria o vídeo fora da cena e ajusta seu tamanho para cobrir a tela.
    document.body.classList.add('ar');
    scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono; canvasWidth: 640; canvasHeight: 480; maxDetectionRate: 30');
    anchor = document.createElement('a-marker');
    anchor.setAttribute('preset', 'hiro');
    anchor.setAttribute('smooth', 'true');
    anchor.addEventListener('markerFound', () => { status.textContent = 'Marcador Hiro detectado'; });
    anchor.addEventListener('markerLost', () => { status.textContent = 'Marcador fora de vista. Aponte a câmera para o Hiro.'; });
    window.addEventListener('arjs-video-loaded', () => {
      status.textContent = 'Aponte a câmera para o marcador Hiro.';
    });
    window.addEventListener('camera-error', () => {
      status.textContent = 'Câmera indisponível. Confira a permissão do Chrome e recarregue.';
    });
    status.textContent = 'Permita o acesso à câmera quando o Chrome solicitar.';
  } else {
    scene.setAttribute('background', 'color: #080e20');
    camera.setAttribute('rotation', '-36.87 0 0');
    status.textContent = mvp ? 'Prévia sem câmera · Sol' : 'Toque no Sol ou em um planeta, ou escolha pelo nome.';
  }
  scene.append(anchor);

  const ambient = document.createElement('a-entity');
  ambient.setAttribute('light', 'type: ambient; intensity: 1.15');
  const key = document.createElement('a-entity');
  key.setAttribute('light', 'type: directional; intensity: 2.1');
  key.setAttribute('position', '-3 6 4');
  scene.append(ambient, key);

  let frameSelection;
  if (!ar) {
    let focused = false;
    const frameScene = () => {
      const aspect = stage.clientWidth / Math.max(stage.clientHeight, 1);
      let distance = Math.max(10, 9.7 / aspect);
      if (mvp) distance = Math.max(3, 1.25 / aspect);
      if (focused) distance = Math.max(3.5, 2.6 / aspect);
      camera.setAttribute('position', { x: 0, y: distance * .6 + (focused ? 1.05 : 0), z: distance * .8 });
    };
    frameSelection = (isFocused) => {
      focused = isFocused;
      frameScene();
    };
    frameScene();
    window.addEventListener('resize', frameScene);
  }

  if (!mvp) {
    registerSolarSystem(window.AFRAME);
    const system = document.createElement('a-entity');
    system.setAttribute('solar-system', '');
    anchor.append(system);
    scene.addEventListener('loaded', () => bindControls(scene, system, frameSelection), { once: true });
    stage.append(scene);
    return;
  }

  const sun = document.createElement('a-sphere');
  sun.setAttribute('radius', '0.38');
  sun.setAttribute('position', '0 0.46 0');
  sun.setAttribute('material', 'shader: flat; color: #ffad42');
  anchor.append(sun);
  stage.append(scene);
}

function bindControls(scene, system, frameSelection) {
  const simulation = system.components['solar-system'];
  const controls = document.querySelector('#controls');
  const details = document.querySelector('#details');
  const name = document.querySelector('#planet-name');
  const pause = document.querySelector('#pause');
  const menu = document.querySelector('#planets');
  const buttons = solarBodies.map((body, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = body.name;
    button.addEventListener('click', () => select(index));
    menu.append(button);
    return button;
  });

  function select(index) {
    if (simulation.selected !== null) return;
    simulation.select(index);
    frameSelection?.(true);
    const body = solarBodies[index];
    name.textContent = body.name;
    document.querySelector('#planet-type').textContent = body.kind;
    document.querySelector('#planet-fact').textContent = body.fact;
    controls.hidden = true;
    details.hidden = false;
    name.focus();
  }

  document.querySelector('#back').addEventListener('click', () => {
    const index = simulation.selected;
    simulation.showOverview();
    frameSelection?.(false);
    details.hidden = true;
    controls.hidden = false;
    buttons[index].focus();
  });
  pause.addEventListener('click', () => {
    simulation.paused = !simulation.paused;
    pause.textContent = simulation.paused ? 'Continuar' : 'Pausar';
  });
  document.querySelector('#speed').addEventListener('change', (event) => {
    simulation.speed = Number(event.target.value);
  });
  scene.canvas.addEventListener('pointerup', (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    const index = simulation.pick(event);
    if (index !== null) select(index);
  });
  controls.hidden = false;
}

function showError(error) {
  console.error(error);
  status.textContent = error.message;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { start().catch(showError); }, { once: true });
} else {
  start().catch(showError);
}

