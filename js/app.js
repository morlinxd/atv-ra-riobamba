const isIOS = (() => {

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1
    )
  );

})();

console.log("🍎 iOS:", isIOS);

let sceneData = null;

let activeAnimation = null;

// ======================================
// INIT
// ======================================

window.addEventListener("DOMContentLoaded", async () => {

  const response = await fetch(
    `./scene.json?v=${Date.now()}`
  );

  sceneData = await response.json();

  initTargets();

});

// ======================================
// TARGETS
// ======================================

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

    target.addEventListener("targetLost", () => {

      cancelAnimationFrame(activeAnimation);

    });

  });

}

// ======================================
// CLEAR
// ======================================

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

  video.src =
    `${config.android.src}?v=${Date.now()}`;

  video.crossOrigin = "anonymous";

  video.loop = true;

  video.muted = true;

  video.playsInline = true;

  video.autoplay = true;

  video.setAttribute(
    "webkit-playsinline",
    "true"
  );

  await video.play().catch(() => { });

  const videoEntity =
    document.createElement("a-video");

  videoEntity.setAttribute(
    "src",
    video.src
  );

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

  // ======================================
  // CANVAS
  // ======================================

  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 512;

  const ctx =
    canvas.getContext("2d", {
      alpha: true
    });

  // ======================================
  // TEXTURE
  // ======================================

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.NoColorSpace;

  texture.format =
    THREE.RGBAFormat;

  texture.premultiplyAlpha =
    true;

  texture.generateMipmaps =
    false;

  texture.minFilter =
    THREE.LinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  texture.needsUpdate =
    true;

  // ======================================
  // GEOMETRY
  // ======================================

  const geometry =
    new THREE.PlaneGeometry(
      config.width || 5,
      config.height || 7
    );

  // ======================================
  // MATERIAL
  // ======================================

  const material =
    new THREE.MeshBasicMaterial({

      map: texture,

      transparent: true,

      alphaTest: 0.01,

      side: THREE.DoubleSide,

      depthWrite: false,

      toneMapped: false

    });

  // ======================================
  // MESH
  // ======================================

  const mesh =
    new THREE.Mesh(
      geometry,
      material
    );

  mesh.renderOrder = 999;

  // ======================================
  // ENTITY
  // ======================================

  const container =
    document.createElement("a-entity");

  target.appendChild(container);

  container.object3D.add(mesh);

  // ======================================
  // ANIMATION
  // ======================================

  let frame = 1;

  async function animate() {

    const num =
      String(frame).padStart(4, "0");

    const imagePath =
      `${sequence.path}/frame_${num}.${sequence.extension}?v=${frame}`;

    try {

      // ======================================
      // FETCH IMAGE
      // ======================================

      const response =
        await fetch(imagePath);

      const blob =
        await response.blob();

      const bitmap =
        await createImageBitmap(blob);

      // ======================================
      // CLEAR
      // ======================================

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // ======================================
      // DRAW
      // ======================================

      ctx.globalCompositeOperation =
        "source-over";

      ctx.drawImage(
        bitmap,
        0,
        0,
        canvas.width,
        canvas.height
      );

      texture.needsUpdate = true;

      // liberar memoria safari
      bitmap.close();

      // ======================================
      // NEXT FRAME
      // ======================================

      frame++;

      if (frame > sequence.frames) {

        frame = 1;

      }

      activeAnimation =
        requestAnimationFrame(animate);

    } catch (err) {

      console.error(
        "❌ Frame error:",
        imagePath
      );

    }

  }

  animate();

}