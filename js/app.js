const isIOS = (() => {

  return (
    /iPad|iPhone|iPod/.test(
      navigator.userAgent
    ) ||
    (
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1
    )
  );

})();

console.log("🍎 iOS:", isIOS);

let sceneData = null;

// ======================================
// INIT
// ======================================

window.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      const response =
        await fetch(
          `./scene.json?v=${Date.now()}`
        );

      sceneData =
        await response.json();

      console.log(
        "✅ scene.json loaded"
      );

      initTargets();

    } catch (err) {

      console.error(
        "❌ scene.json error:",
        err
      );

    }

  }
);

// ======================================
// INIT TARGETS
// ======================================

function initTargets() {

  sceneData.targets.forEach((config) => {

    const target =
      document.querySelector(
        `[mindar-image-target="targetIndex: ${config.id}"]`
      );

    if (!target) {

      console.warn(
        "⚠️ Target not found:",
        config.id
      );

      return;

    }

    // ======================================
    // TARGET FOUND
    // ======================================

    target.addEventListener(
      "targetFound",
      async () => {

        console.log(
          "🎯 TARGET FOUND:",
          config.id
        );

        clearTargets();

        await loadVideo(
          target,
          config
        );

      }
    );

    // ======================================
    // TARGET LOST
    // ======================================

    target.addEventListener(
      "targetLost",
      () => {

        console.log(
          "❌ TARGET LOST:",
          config.id
        );

        stopAllVideos();

      }
    );

  });

}

// ======================================
// CLEAR TARGETS
// ======================================

function clearTargets() {

  stopAllVideos();

  document
    .querySelectorAll(
      "[mindar-image-target]"
    )
    .forEach((target) => {

      target.innerHTML = "";

    });

}

// ======================================
// STOP VIDEOS
// ======================================

function stopAllVideos() {

  const videos =
    document.querySelectorAll("video");

  videos.forEach((video) => {

    try {

      video.pause();
      video.currentTime = 0;

    } catch (err) {}

  });

}

// ======================================
// LOAD VIDEO
// ======================================

async function loadVideo(
  target,
  config
) {

  try {

    // ======================================
    // SOURCE
    // ======================================

    const src = isIOS
      ? config.ios.src
      : config.android.src;

    console.log(
      "📹 Loading:",
      src
    );

    // ======================================
    // VIDEO ELEMENT
    // ======================================

    const video =
      document.createElement("video");

    video.src =
      `${src}?v=${Date.now()}`;

    video.crossOrigin =
      "anonymous";

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

    video.setAttribute(
      "muted",
      ""
    );

    video.setAttribute(
      "autoplay",
      ""
    );

    // ======================================
    // WAIT READY
    // ======================================

    await new Promise((resolve) => {

      video.onloadeddata = () => {

        console.log(
          "✅ Video loaded"
        );

        resolve();

      };

    });

    // ======================================
    // PLAY
    // ======================================

    await video.play();

    // ======================================
    // VIDEO ENTITY
    // ======================================

    const videoEntity =
      document.createElement(
        "a-video"
      );

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

    videoEntity.setAttribute(
      "material",
      `
      shader: flat;
      transparent: true;
      alphaTest: 0.01;
      side: double;
      `
    );

    target.appendChild(
      videoEntity
    );

    console.log(
      "✅ Video entity created"
    );

  } catch (err) {

    console.error(
      "❌ loadVideo error:",
      err
    );

  }

}