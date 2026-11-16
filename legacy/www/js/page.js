function startClock(clock) {
  const target = new Date(clock.dataset.target).getTime();
  const values = Object.fromEntries(
    [...clock.querySelectorAll("[data-unit]")].map((element) => [element.dataset.unit, element])
  );

  function tick() {
    const left = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const parts = {
      days: Math.floor(left / 86400),
      hours: Math.floor(left / 3600) % 24,
      minutes: Math.floor(left / 60) % 60,
      seconds: left % 60,
    };
    for (const [unit, value] of Object.entries(parts)) {
      values[unit].textContent = String(value).padStart(2, "0");
    }
    if (left > 0) setTimeout(tick, 1000 - (Date.now() % 1000));
  }

  tick();
}

// Nothing collects the addresses yet, so say so instead of pretending it worked.
function startSignup(form) {
  const status = form.querySelector(".signup__status");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "Inschrijven is nog niet mogelijk.";
  });
}

startClock(document.querySelector(".clock"));
startSignup(document.querySelector(".signup"));
