/* NOVA's first tiny local brain. No remote model or human voice data. */
(() => {
  const clean = s => (s || "").toLowerCase().trim().replace(/[!?.,]+$/,"");
  const has = (s, words) => words.some(w => s.includes(w));
  const isBangla = s => /[\u0980-\u09FF]/.test(s);
  const isHindi = s => /[\u0900-\u097F]/.test(s);
  const replies = {
    bn: {
      greeting: "হ্যাঁ, বলো। শুনছি।",
      sad: "কী হয়েছে? চাইলে আমাকে বলতে পারো।",
      tired: "আজ কি খুব ক্লান্ত লাগছে? একটু বিশ্রাম নেবে?",
      thanks: "তোমাকে স্বাগতম। ❤️",
      sorry: "ঠিক আছে। ধীরে ধীরে বলো, আমি শুনছি।",
      love: "তোমার কথাটা বুঝলাম। ❤️",
      bye: "আবার কথা হবে। নিজের খেয়াল রেখো।",
      default: "হুম, বুঝতে চেষ্টা করছি। আরেকটু বলবে?"
    },
    en: {
      greeting: "Hey. I'm listening.",
      sad: "Oh, what happened? Want to tell me?",
      tired: "Sounds like a long day. Want to take a little break?",
      thanks: "You're welcome. I'm glad I could help.",
      sorry: "It's okay. Take your time — I'm listening.",
      love: "That means something. ❤️",
      bye: "Talk soon. Take care of yourself.",
      default: "I hear you. Tell me a little more?"
    },
    hi: {
      greeting: "हाँ, बताओ। मैं सुन रही हूँ।",
      sad: "क्या हुआ? चाहो तो मुझे बता सकते हो।",
      tired: "आज थक गए हो क्या? थोड़ा आराम कर लो।",
      thanks: "कोई बात नहीं। ❤️",
      sorry: "ठीक है, आराम से बताओ। मैं सुन रही हूँ।",
      love: "तुम्हारी बात समझ रही हूँ। ❤️",
      bye: "फिर बात करेंगे। अपना ख्याल रखना।",
      default: "हम्म, समझने की कोशिश कर रही हूँ। थोड़ा और बताओ?"
    }
  };
  function detectLanguage(s) {
    if (isBangla(s)) return "bn";
    if (isHindi(s)) return "hi";
    return "en";
  }
  function intent(s) {
    if (has(s, ["hello","hi","hey","হ্যালো","হাই","নমস্কার","नमस्ते","हाय"])) return "greeting";
    if (has(s, ["ভালো নেই","মন খারাপ","কষ্ট","কাঁদ","খারাপ লাগ","sad","upset","not good","feel bad","lonely","দুঃখ","उदास","अच्छा नहीं"])) return "sad";
    if (has(s, ["ক্লান্ত","ঘুম","বিশ্রাম","tired","exhausted","sleepy","थक","नींद"])) return "tired";
    if (has(s, ["ধন্যবাদ","থ্যাংক","thanks","thank you","शुक्रिया","धन्यवाद"])) return "thanks";
    if (has(s, ["sorry","দুঃখিত","মাফ","माफ़"])) return "sorry";
    if (has(s, ["ভালোবাসি","love you","ভালবাসি","प्यार"])) return "love";
    if (has(s, ["বিদায়","যাই","bye","good night","শুভরাত্রি","अलविदा"])) return "bye";
    return "default";
  }
  function localReply(input, history) {
    const s = clean(input);
    if (!s) return "একটু লিখে বলো, আমি শুনছি।";
    const lang = detectLanguage(input);
    const bank = replies[lang];
    const kind = intent(s);
    if (kind !== "default") return bank[kind];
    if (has(s, ["কেন","why","क्यों"]) && history.length) {
      return lang === "bn" ? "কোন ব্যাপারটা কেন, একটু বুঝিয়ে বলবে?" : lang === "hi" ? "किस बात के बारे में पूछ रहे हो?" : "Which part do you mean? Tell me a little more.";
    }
    if (has(s, ["তুমি কে","তোমার নাম","who are you","your name","तुम कौन"])) {
      return lang === "bn" ? "আমি NOVA। তোমার ছোট্ট AI সঙ্গী।" : lang === "hi" ? "मैं NOVA हूँ, तुम्हारी छोटी AI साथी।" : "I'm NOVA, your little AI companion.";
    }
    return bank.default;
  }
  window.NOVABrain = { localReply };
})();