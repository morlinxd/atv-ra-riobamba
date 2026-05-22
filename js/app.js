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

      await loadVideo(target, config);

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

  // eliminar videos viejos
  document
    .querySelectorAll("video[data-ar-video]")
    .forEach((video) => {

      video.pause();

      video.remove();

    });

}

// ======================================
// VIDEO
// ======================================

async function loadVideo(target, config) {

  const source = isIOS
    ? config.ios.src
    : config.android.src;

  console.log("🎬 SOURCE:", source);

  // ======================================
  // VIDEO ELEMENT
  // ======================================

  const video = document.createElement("video");

  video.id = `video-${config.id}`;

  video.setAttribute(
    "data-ar-video",
    "true"
  );

  video.src = `${source}?v=${Date.now()}`;

  video.crossOrigin = "anonymous";

  video.loop = true;

  video.muted = true;

  video.autoplay = true;

  video.playsInline = true;

  video.preload = "auto";

  video.setAttribute(
    "webkit-playsinline",
    "true"
  );

  video.setAttribute(
    "playsinline",
    "true"
  );

  // ocultar video HTML
  video.style.position = "fixed";

  video.style.opacity = "0";

  video.style.pointerEvents = "none";

  video.style.width = "1px";

  video.style.height = "1px";

  // ======================================
  // ADD TO DOM
  // ======================================

  document.body.appendChild(video);

  // ======================================
  // WAIT VIDEO READY
  // ======================================

  await new Promise((resolve, reject) => {

    video.onloadeddata = () => {

      console.log("✅ VIDEO READY");

      resolve();

    };

    video.onerror = (e) => {

      console.error(
        "❌ VIDEO ERROR",
        e
      );

      reject(e);

    };

  });

  // ======================================
  // PLAY
  // ======================================

  const playVideo = async () => {

    try {

      await video.play();

      console.log("▶️ PLAYING");

    } catch (err) {

      console.error(
        "❌ PLAY ERROR",
        err
      );

    }

  };

  await playVideo();

  document.body.addEventListener(
    "touchstart",
    playVideo,
    { once: true }
  );

  // ======================================
  // AFRAME VIDEO
  // ======================================

  const videoEntity =
    document.createElement("a-video");

  videoEntity.setAttribute(
    "src",
    `#${video.id}`
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

  videoEntity.setAttribute(
    "material",
    "shader: flat"
  );

  // ======================================
  // TRANSPARENCIA IOS
  // ======================================

  videoEntity.setAttribute(
    "transparent",
    "true"
  );

  videoEntity.setAttribute(
    "alpha-test",
    "0.01"
  );

  target.appendChild(videoEntity);

}