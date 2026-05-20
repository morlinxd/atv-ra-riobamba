const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

let sceneData = null;

let activeContent = null;

window.addEventListener("DOMContentLoaded", async () => {

  const res = await fetch("./scene.json");
  sceneData = await res.json();

  initTargets();

});

function initTargets() {

  sceneData.targets.forEach((config) => {

    const target = document.querySelector(
      `[mindar-image-target="targetIndex: ${config.id}"]`
    );

    target.addEventListener("targetFound", async () => {

      console.log("TARGET FOUND:", config.id);

      document.getElementById("loading").style.display = "none";

      if (activeContent !== null && activeContent !== config.id) {
        unloadTarget(activeContent);
      }

      activeContent = config.id;

      await loadTarget(config);

    });

    target.addEventListener("targetLost", () => {

      console.log("TARGET LOST:", config.id);

    });

  });

}

async function loadTarget(config) {

  unloadTarget(config.id);

  if (config.type === "video") {

    await loadVideo(config);

  }

  if (config.type === "sequence") {

    await loadSequence(config);

  }

}

function unloadTarget(id) {

  const target = document.querySelector(
    `[mindar-image-target="targetIndex: ${id}"]`
  );

  target.innerHTML = "";

}

async function loadVideo(config) {

  const target = document.querySelector(
    `[mindar-image-target="targetIndex: ${config.id}"]`
  );

  const video = document.createElement("video");

  video.src = isIOS
    ? config.ios
    : config.android;

  video.crossOrigin = "anonymous";

  video.loop = true;
  video.muted = true;
  video.playsInline = true;

  video.setAttribute("webkit-playsinline", "true");

  await video.play().catch(() => {});

  const videoAsset = document.createElement("a-video");

  videoAsset.setAttribute("src", video.src);

  videoAsset.setAttribute("width", "1");
  videoAsset.setAttribute("height", "0.6");

  videoAsset.setAttribute("position", "0 0 0");

  target.appendChild(videoAsset);

}

async function loadSequence(config) {

  const target = document.querySelector(
    `[mindar-image-target="targetIndex: ${config.id}"]`
  );

  const canvas = document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);

  const plane = document.createElement("a-plane");

  plane.setAttribute("width", "1");
  plane.setAttribute("height", "1");

  target.appendChild(plane);

  let frame = 1;

  async function animate() {

    const img = new Image();

    const num = String(frame).padStart(4, "0");

    img.src = `${config.path}/frame_${num}.${config.extension}`;

    await img.decode();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    texture.needsUpdate = true;

    plane.getObject3D("mesh").material.map = texture;

    frame++;

    if (frame > config.frames) {
      frame = 1;
    }

    requestAnimationFrame(animate);

  }

  animate();

}