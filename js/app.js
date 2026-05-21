const isIOS =
  /iPhone|iPad|iPod/i.test(navigator.userAgent);

let sceneData = null;

let activeAnimation = null;

window.addEventListener("DOMContentLoaded", async () => {

  const response = await fetch("./scene.json");

  sceneData = await response.json();

  initTargets();

});

function initTargets() {

  sceneData.targets.forEach((config) => {

    const target = document.querySelector(
      `[mindar-image-target="targetIndex: ${config.id}"]`
    );

    target.addEventListener("targetFound", async () => {

      console.log("🎯 TARGET:", config.id);

      clearTargets();

      if (isIOS) {

        await loadSequence(target, config);

      } else {

        await loadVideo(target, config);

      }

    });

  });

}

function clearTargets() {

  cancelAnimationFrame(activeAnimation);

  document
    .querySelectorAll("[mindar-image-target]")
    .forEach((target) => {

      target.innerHTML = "";

    });

}

// ======================================
// VIDEO ANDROID
// ======================================

async function loadVideo(target, config) {

  const video = document.createElement("video");

  video.src = config.android.src;

  video.crossOrigin = "anonymous";

  video.loop = true;

  video.muted = true;

  video.playsInline = true;

  video.setAttribute(
    "webkit-playsinline",
    "true"
  );

  await video.play().catch(() => {});

  const videoEntity =
    document.createElement("a-video");

  videoEntity.setAttribute("src", video.src);

  videoEntity.setAttribute(
    "width",
    config.width || 5
  );

  videoEntity.setAttribute(
    "height",
    config.height || 7
  );

  videoEntity.setAttribute(
    "position",
    "0 0 0"
  );

  target.appendChild(videoEntity);

}

// ======================================
// SEQUENCE IOS
// ======================================

async function loadSequence(target, config) {

  const sequence = config.ios;

  // =====================================
  // CANVAS
  // =====================================

  const canvas = document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  // =====================================
  // TEXTURE
  // =====================================

  const texture = new THREE.CanvasTexture(canvas);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // =====================================
  // PLANE
  // =====================================

  const plane = document.createElement("a-plane");

  plane.setAttribute(
    "width",
    config.width || 5
  );

  plane.setAttribute(
    "height",
    config.height || 7
  );

  plane.setAttribute(
    "position",
    "0 0 0"
  );

  target.appendChild(plane);

  // =====================================
  // PRELOAD FRAMES
  // =====================================

  console.log("⚡ Precargando frames...");

  const frames = [];

  for (let i = 1; i <= sequence.frames; i++) {

    const num = String(i).padStart(4, "0");

    const img = new Image();

    img.src =
      `${sequence.path}/frame_${num}.${sequence.extension}`;

    await img.decode();

    frames.push(img);

    // progreso
    if (i % 10 === 0) {

      console.log(
        `📦 Frames cargados: ${i}/${sequence.frames}`
      );

    }

  }

  console.log("✅ Frames precargados");

  // =====================================
  // MESH
  // =====================================

  let mesh = null;

  const waitMesh = setInterval(() => {

    mesh = plane.getObject3D("mesh");

    if (mesh) {

      mesh.material.map = texture;

      mesh.material.transparent = true;

      mesh.material.needsUpdate = true;

      clearInterval(waitMesh);

    }

  }, 16);

  // =====================================
  // ANIMATION
  // =====================================

  let frame = 0;

  const targetFPS = 24;

  const frameTime = 1000 / targetFPS;

  let lastTime = performance.now();

  function animate(now) {

    activeAnimation =
      requestAnimationFrame(animate);

    // limitar fps
    if (now - lastTime < frameTime) return;

    lastTime = now;

    const img = frames[frame];

    if (!img) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.drawImage(
      img,
      0,
      0,
      canvas.width,
      canvas.height
    );

    texture.needsUpdate = true;

    frame++;

    if (frame >= frames.length) {
      frame = 0;
    }

  }

  animate();

}