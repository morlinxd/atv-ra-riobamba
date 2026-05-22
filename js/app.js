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
        await fetch("./scene.json");

      sceneData =
        await response.json();

      await preloadVideos();

      initTargets();

    } catch (err) {

      console.error(err);

    }

  }
);

// ======================================
// PRELOAD
// ======================================

async function preloadVideos() {

  const assets =
    document.querySelector("a-assets");

  sceneData.targets.forEach((config) => {

    const video =
      document.createElement("video");

    video.id =
      `video-${config.id}`;

    video.src = isIOS
      ? config.ios.src
      : config.android.src;

    video.crossOrigin =
      "anonymous";

    video.loop = true;

    video.muted = true;

    video.preload = "auto";

    video.playsInline = true;

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

    assets.appendChild(video);

  });

}

// ======================================
// TARGETS
// ======================================

function initTargets() {

  sceneData.targets.forEach((config) => {

    const target =
      document.querySelector(
        `[mindar-image-target="targetIndex: ${config.id}"]`
      );

    const video =
      document.querySelector(
        `#video-${config.id}`
      );

    let videoEntity = null;

    // ======================================
    // FOUND
    // ======================================

    target.addEventListener(
      "targetFound",
      async () => {

        console.log(
          "🎯 TARGET:",
          config.id
        );

        stopAllVideos();

        // PLAY
        await video.play().catch(() => {});

        // evitar duplicados
        if (videoEntity) return;

        // ENTITY
        videoEntity =
          document.createElement(
            "a-video"
          );

        videoEntity.setAttribute(
          "src",
          `#video-${config.id}`
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

      }
    );

    // ======================================
    // LOST
    // ======================================

    target.addEventListener(
      "targetLost",
      () => {

        console.log(
          "❌ LOST:",
          config.id
        );

        video.pause();

      }
    );

  });

}

// ======================================
// STOP
// ======================================

function stopAllVideos() {

  sceneData.targets.forEach((config) => {

    const video =
      document.querySelector(
        `#video-${config.id}`
      );

    if (!video) return;

    video.pause();

    video.currentTime = 0;

  });

}