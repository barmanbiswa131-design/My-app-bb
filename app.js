(() => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("message");
  const chat = document.getElementById("chat");
  const welcome = document.getElementById("welcome");
  const modeLabel = document.getElementById("mode-label");
  const note = document.getElementById("connection-note");
  const history = [];
  let onlineReady = false;
  const cfg = window.NOVA_CONFIG || {};
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
  }
  form.addEventListener("submit", e => { e.preventDefault(); send(input.value); });
  input.addEventListener("input", () => { input.style.height="auto"; input.style.height=Math.min(input.scrollHeight,120)+"px"; });
  document.querySelectorAll("[data-prompt]").forEach(btn => btn.addEventListener("click",()=>send(btn.dataset.prompt)));
  document.getElementById("new-chat").addEventListener("click",()=>{
    history.length = 0; chat.replaceChildren(); chat.classList.remove("active"); welcome.hidden = false; input.focus();
  });
  window.addEventListener("online",()=>{ if(cfg.API_BASE_URL) modeLabel.textContent="HYBRID READY"; });
  window.addEventListener("offline",()=>{ modeLabel.textContent="OFFLINE BRAIN"; });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }
})();