const targets = document.querySelectorAll("[mindar-image-target]");

targets.forEach((target, index) => {

  target.addEventListener("targetFound", async () => {
    console.log("Detectado:", index);

    await loadExperience(index);
  });

  target.addEventListener("targetLost", () => {
    unloadExperience(index);
  });

});