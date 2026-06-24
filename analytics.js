(function () {
  const endpoint = "https://wplay-teste-4h.onrender.com/api/obrigado-view";
  const visitorKey = "wplay_obrigado_visitor_id";
  const sessionKey = "wplay_obrigado_session_id";

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}_${window.crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  function storedId(storage, key, prefix) {
    try {
      let id = storage.getItem(key);
      if (!id) {
        id = makeId(prefix);
        storage.setItem(key, id);
      }
      return id;
    } catch (error) {
      return makeId(prefix);
    }
  }

  const payload = {
    page: "/obrigado",
    url: window.location.href,
    referrer: document.referrer || "",
    visitor_id: storedId(window.localStorage, visitorKey, "visitor"),
    session_id: storedId(window.sessionStorage, sessionKey, "session"),
  };
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
    if (navigator.sendBeacon(endpoint, blob)) {
      return;
    }
  }

  fetch(endpoint, {
    method: "POST",
    mode: "cors",
    keepalive: true,
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body,
  }).catch(function () {});
})();
