/* NOVA local NLU v0.2 — lightweight phrase and context matching; not a large language model. */
(() => {
  const clean = value => (value || "").toLowerCase()
    .normalize("NFKC")
    .replace(/[’']/g, "'")
    .replace(/[!?.,;:।]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const has = (s, words) => words.some(word => s.includes(word));
  const bengaliScript = /[\u0980-\u09FF]/;
  const devanagari = /[\u0900-\u097F]/;
  const romanBanglaWords = /\b(ami|amar|amake|tumi|tomar|toke|tor|valo|bhalo|kharap|nei|na|keno|ki|kemon|achi|achhi|bol|bolo|shono|suno|mon|khub|onek|hobe|korbo|kor|kaj|ghum|klanto|dhonnobad|bhalobashi|bhalobasi|bondhu|ajke|kalke)\b/;
  const romanHindiWords = /\b(main|mera|mujhe|tum|aap|kaise|kyun|kya|nahi|nahin|accha|achha|theek|thik|udaas|thak|dost|shukriya|pyaar|karo|batao|suno)\b/;
  const banks = {
    bn: {
      greeting:"হ্যাঁ, বলো। শুনছি।",
      sad:"কী হয়েছে? চাইলে আমাকে বলতে পারো।",
      tired:"আজ কি খুব ক্লান্ত লাগছে? একটু বিশ্রাম নেবে?",
      thanks:"তোমাকে স্বাগতম। ❤️",
      sorry:"ঠিক আছে। ধীরে ধীরে বলো, আমি শুনছি।",
      love:"তোমার কথাটা বুঝলাম। ❤️",
      bye:"আবার কথা হবে। নিজের খেয়াল রেখো।",
      angry:"বুঝতে পারছি, ব্যাপারটা তোমাকে বিরক্ত করেছে। কী হয়েছে বলবে?",
      happy:"বাহ, এটা তো ভালো খবর! কী হয়েছে বলো?",
      default:"হুম, বুঝতে চেষ্টা করছি। আরেকটু বলবে?"
    },
    "bn-rom": {
      greeting:"Haan, bolo. Shunchhi.",
      sad:"Ki hoyeche? Chaile amake bolte paro.",
      tired:"Aj ki khub klanto lagche? Ektu bishram nebe?",
      thanks:"Tomake shagotom. ❤️",
      sorry:"Thik ache. Dhire dhire bolo, ami shunchhi.",
      love:"Tomar kothata bujhlam. ❤️",
      bye:"Abar kotha hobe. Nijer kheyal rekho.",
      angry:"Bujhte parchhi, byaparta tomake birakto koreche. Ki hoyeche bolbe?",
      happy:"Bah, eta to bhalo khobor! Ki hoyeche bolo?",
      default:"Hmm, bujhte cheshta korchhi. Arektu bolbe?"
    },
    hi: {
      greeting:"हाँ, बताओ। मैं सुन रही हूँ।",
      sad:"क्या हुआ? चाहो तो मुझे बता सकते हो।",
      tired:"आज थक गए हो क्या? थोड़ा आराम कर लो।",
      thanks:"कोई बात नहीं। ❤️",
      sorry:"ठीक है, आराम से बताओ। मैं सुन रही हूँ।",
      love:"तुम्हारी बात समझ रही हूँ। ❤️",
      bye:"फिर बात करेंगे। अपना ख्याल रखना।",
      angry:"लगता है यह बात तुम्हें परेशान कर रही है। क्या हुआ?",
      happy:"अरे वाह, यह तो अच्छी खबर है! बताओ क्या हुआ?",
      default:"हम्म, समझने की कोशिश कर रही हूँ। थोड़ा और बताओ?"
    },
    "hi-rom": {
      greeting:"Haan, bolo. Main sun rahi hoon.",
      sad:"Kya hua? Chaho to mujhe bata sakte ho.",
      tired:"Aaj thak gaye ho kya? Thoda aaram kar lo.",
      thanks:"Koi baat nahi. ❤️",
      sorry:"Theek hai, aaram se batao. Main sun rahi hoon.",
      love:"Tumhari baat samajh rahi hoon. ❤️",
      bye:"Phir baat karenge. Apna khayal rakhna.",
      angry:"Lagta hai ye baat tumhe pareshan kar rahi hai. Kya hua?",
      happy:"Wah, ye to achhi khabar hai! Batao kya hua?",
      default:"Hmm, samajhne ki koshish kar rahi hoon. Thoda aur batao?"
    },
    en: {
      greeting:"Hey. I'm listening.",
      sad:"Oh, what happened? Want to tell me?",
      tired:"Sounds like a long day. Want to take a little break?",
      thanks:"You're welcome. I'm glad I could help.",
      sorry:"It's okay. Take your time — I'm listening.",
      love:"I hear you. ❤️",
      bye:"Talk soon. Take care of yourself.",
      angry:"That sounds frustrating. Want to tell me what happened?",
      happy:"That's lovely news! What happened?",
      default:"I hear you. Tell me a little more?"
    }
  };
  function language(s) {
    if (bengaliScript.test(s)) return "bn";
    if (devanagari.test(s)) return "hi";
    if (romanBanglaWords.test(s)) return "bn-rom";
    if (romanHindiWords.test(s)) return "hi-rom";
    return "en";
  }
  function intent(s) {
    if (has(s,["hello","hi","hey","হ্যালো","হাই","নমস্কার","नमस्ते","হ্যালো","ki khobor","kemon acho","kemon achho","kmn acho","kmn acho"])) return "greeting";
    if (has(s,["ভালো নেই","ভাল নেই","মন খারাপ","কষ্ট","কাঁদ","খারাপ লাগ","sad","upset","not good","feel bad","lonely","দুঃখ","उदास","अच्छा नहीं","valo nei","bhalo nei","mon kharap","kharap lagche","kharap lagchhe","amar valo lagche na","amar bhalo lagche na","mon ta kharap"])) return "sad";
    if (has(s,["ক্লান্ত","ঘুম","বিশ্রাম","tired","exhausted","sleepy","थक","नींद","klanto","ghum pachhe","ghum pacche","bishram"])) return "tired";
    if (has(s,["ধন্যবাদ","থ্যাংক","thanks","thank you","शुक्रिया","धन्यवाद","dhonnobad","thankx"])) return "thanks";
    if (has(s,["sorry","দুঃখিত","মাফ","माफ़","sori"])) return "sorry";
    if (has(s,["ভালোবাসি","love you","ভালবাসি","प्यार","bhalobashi","valobashi"])) return "love";
    if (has(s,["বিদায়","যাই","bye","good night","শুভরাত্রি","अलविदा","biday","jacchi","jachi"])) return "bye";
    if (has(s,["রাগ","বিরক্ত","ক্ষুব্ধ","angry","annoyed","irritated","রাগ হচ্ছে","rag hocche","rag hochhe","birakto"])) return "angry";
    if (has(s,["খুশি","আনন্দ","দারুণ খবর","happy","excited","great news","khushi","moja hoyeche","darun"])) return "happy";
    return "default";
  }
  function localReply(input, history) {
    const s = clean(input);
    if (!s) return "একটু লিখে বলো, আমি শুনছি।";
    const lang = language(input);
    const bank = banks[lang];
    const kind = intent(s);
    if (kind !== "default") return bank[kind];
    if (has(s,["তুমি কে","তোমার নাম","who are you","your name","तुम कौन","tumi ke","tor nam ki","tomar nam ki","tumar nam ki"])) {
      return lang.startsWith("bn") ? (lang==="bn"?"আমি NOVA। তোমার ছোট্ট AI সঙ্গী।":"Ami NOVA. Tomar chhoto AI sathi.") : lang.startsWith("hi") ? (lang==="hi"?"मैं NOVA हूँ, तुम्हारी छोटी AI साथी।":"Main NOVA hoon, tumhari chhoti AI saathi.") : "I'm NOVA, your small AI companion.";
    }
    if (has(s,["কেন","why","क्यों","keno","kyun"]) && history && history.length) {
      return lang.startsWith("bn") ? (lang==="bn"?"কোন ব্যাপারটা কেন, একটু বুঝিয়ে বলবে?":"Kon byaparta keno, ektu bujhiye bolbe?") : lang.startsWith("hi") ? (lang==="hi"?"किस बात के बारे में पूछ रहे हो?":"Kis baat ke baare mein pooch rahe ho?") : "Which part do you mean? Tell me a little more.";
    }
    if (has(s,["তুমি শুনছ","শুনতে পাচ্ছ","are you listening","can you hear me","shunchho","shunchis","suncho"])) {
      return lang.startsWith("bn") ? (lang==="bn"?"হ্যাঁ, তোমার মেসেজ পাচ্ছি। বলো।":"Haan, tomar message pachchhi. Bolo.") : "Yes, I'm receiving your messages. Go ahead.";
    }
    if (has(s,["কি করছ","কী করছ","what are you doing","ki korcho","ki korchho"])) {
      return lang.startsWith("bn") ? (lang==="bn"?"তোমার সঙ্গে কথা বলছি। তুমি কী করছ?":"Tomar sathe kotha bolchhi. Tumi ki korchho?") : "I'm here chatting with you. What are you up to?";
    }
    return bank.default;
  }
  window.NOVABrain = { localReply, language, intent };
})();