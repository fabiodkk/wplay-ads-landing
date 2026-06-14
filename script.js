const target = "https://wplay-teste-4h.onrender.com/";

window.addEventListener("load", () => {
  try {
    fetch(target, { mode: "no-cors", cache: "no-store", keepalive: true });
  } catch (_error) {
    // Best-effort warm-up only; the visible page must work without it.
  }
});
