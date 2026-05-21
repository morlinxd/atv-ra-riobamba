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

  await video.play().catch(() => { });

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

  const canvas = document.createElement("canvas");

  canvas.width = 720;

  canvas.height = 720;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    premultipliedAlpha: false
  });

  const texture = new THREE.CanvasTexture(canvas);

  texture.format = THREE.RGBAFormat;

  texture.premultiplyAlpha = false;

  texture.generateMipmaps = false;

  texture.minFilter = THREE.LinearFilter;

  texture.magFilter = THREE.LinearFilter;

  texture.needsUpdate = true;

  const plane =
    document.createElement("a-plane");

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

  let frame = 1;

  async function animate() {

    const num =
      String(frame).padStart(4, "0");

    const imagePath =
      `${sequence.path}/frame_${num}.${sequence.extension}`;

    const img = new Image();

    img.src = imagePath;

    try {

      await img.decode();

      ctx.globalCompositeOperation = "copy";

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

      const mesh =
        plane.getObject3D("mesh");

      if (mesh) {

        mesh.material.map = texture;

        mesh.material.transparent = true;

        mesh.material.alphaTest = 0.01;

        mesh.material.depthWrite = false;

        mesh.material.side = THREE.DoubleSide;

        mesh.material.premultipliedAlpha = false;

        mesh.material.opacity = 1;

        mesh.material.needsUpdate = true;

        mesh.material.needsUpdate = true;

      }

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