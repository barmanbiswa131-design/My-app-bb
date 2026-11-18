(() => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("message");
  const chat = document.getElementById("chat");
  const welcome = document.getElementById("welcome");
  const modeLabel = document.getElementById("mode-label");
  const note = document.getElementById("connection-note");
  const voiceToggle = document.getElementById("voice-toggle");
  const history = [];
  let onlineReady = false;
  let voiceEnabled = false;
  let voices = [];
  const cfg = window.NOVA_CONFIG || {};

  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    voices = window.speechSynthesis.getVoices();
  }
  function chooseVoice(text) {
    const lang = /[\u0900-\u097F]/.test(text) ? "hi" : /[\u0980-\u09FF]/.test(text) ? "bn" : /\b(kaise|hai|ho|nahi|kya|main|tum)\b/i.test(text) ? "hi" : "bn";
    const matching = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(lang));
    return matching.find(v => /female|woman|zira|heera|swara|kalpana|priya|google.*female/i.test(v.name)) || matching[0] || voices.find(v => /en/i.test(v.lang)) || null;
  }
  function speak(text) {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = chooseVoice(text);
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    else { utterance.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : /[\u0980-\u09FF]/.test(text) ? "bn-IN" : "hi-IN"; }
    utterance.rate = 0.94;
    utterance.pitch = 1.12;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
  if ("speechSynthesis" in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  } else {
    voiceToggle.disabled = true;
    voiceToggle.textContent = "VOICE UNAVAILABLE";
  }
  voiceToggle.addEventListener("click", () => {
    voiceEnabled = !voiceEnabled;
    voiceToggle.textContent = voiceEnabled ? "VOICE ON" : "VOICE OFF";
    voiceToggle.setAttribute("aria-pressed", String(voiceEnabled));
    if (!voiceEnabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
  });
  if (cfg.API_BASE_URL) {
    onlineReady = true;
    modeLabel.textContent = "HYBRID READY";
    note.textContent = "Online connection available · Session chat";
  }
  function addMessage(text, who) {
    const row = document.createElement("div");
    row.className = "message " + who;
    if (who === "ai") {
      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = "N";
      row.appendChild(avatar);
    }
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
  }
  async function getReply(text) {
    if (onlineReady && navigator.onLine) {
      try {
        const response = await fetch(cfg.API_BASE_URL.replace(/\/$/,"") + "/chat", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({message:text, history:history.slice(-8)})
        });
        if (response.ok) {
          const data = await response.json();
          if (data.reply) return data.reply;
        }
      } catch (_) { /* use local brain if the network is unavailable */ }
    }
    return window.NOVABrain.localReply(text, history);
  }
  async function send(text) {
    text = text.trim();
    if (!text) return;
    welcome.hidden = true;
    chat.classList.add("active");
    addMessage(text,"user");
    history.push({role:"user",content:text});
    input.value = "";
    input.style.height = "auto";
    const reply = await getReply(text);
    addMessage(reply,"ai");
    history.push({role:"assistant",content:reply});
    speak(reply);
  }
  form.addEventListener("submit", e => { e.preventDefault(); send(input.value); });
  input.addEventListener("input", () => { input.style.height="auto"; input.style.height=Math.min(input.scrollHeight,120)+"px"; });
  document.querySelectorAll("[data-prompt]").forEach(btn => btn.addEventListener("click",()=>send(btn.dataset.prompt)));
  document.getElementById("new-chat").addEventListener("click",()=>{
    history.length = 0; chat.replaceChildren(); chat.classList.remove("active"); welcome.hidden = false; input.focus();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });
  window.addEventListener("online",()=>{ if(cfg.API_BASE_URL) modeLabel.textContent="HYBRID READY"; });
  window.addEventListener("offline",()=>{ modeLabel.textContent="OFFLINE BRAIN"; });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }
})();