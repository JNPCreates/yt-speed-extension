const enabledToggle = document.getElementById("enabled");
const speedSlider = document.getElementById("speed-slider");
const speedDisplay = document.getElementById("speed-display");

browser.storage.local.get({ enabled: true, speed: 1.25 }).then(function (settings) {
  enabledToggle.checked = settings.enabled;
  if (!settings.enabled) document.body.classList.add("off");
  setSlider(settings.speed);
});

enabledToggle.addEventListener("change", function () {
  const enabled = enabledToggle.checked;
  browser.storage.local.set({ enabled: enabled });
  document.body.classList.toggle("off", !enabled);
});

speedSlider.addEventListener("input", function () {
  const speed = parseFloat(speedSlider.value);
  updateDisplay(speed);
  updateTrackFill(speed);
});

speedSlider.addEventListener("change", function () {
  browser.storage.local.set({ speed: parseFloat(speedSlider.value) });
});

function setSlider(speed) {
  speedSlider.value = speed;
  updateDisplay(speed);
  updateTrackFill(speed);
}

function updateDisplay(speed) {
  // toFixed(2) then strip trailing zeros, but always keep at least one decimal
  const trimmed = parseFloat(speed.toFixed(2)).toString();
  const formatted = trimmed.includes(".") ? trimmed : trimmed + ".0";
  speedDisplay.textContent = formatted + "×";
}

function updateTrackFill(speed) {
  const min = parseFloat(speedSlider.min);
  const max = parseFloat(speedSlider.max);
  const pct = ((speed - min) / (max - min)) * 100;
  speedSlider.style.background =
    `linear-gradient(to right, #c00 ${pct}%, #ddd ${pct}%)`;
}
