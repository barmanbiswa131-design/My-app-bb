/* NOVA Brain v0.5 — Bengali + Hindi only; supports native scripts and Banglish/Hinglish.
   Lightweight local intent/context engine. Curated phrase patterns, not a trained LLM. */
(() => {
  "use strict";
  const clean = v => String(v || "").toLowerCase().normalize("NFKC")
    .replace(/[’‘']/g, "").replace(/[!?.,;:।॥…()[\]{}"'`~@#$%^&*_+=<>\\/|-]+/g, " ")
    .replace(/\s+/g, " ").trim();
  const hasAny = (s, list) => list.some(x => s.includes(x));
  const bnScript = /[\u0980-\u09FF]/;
  const hiScript = /[\u0900-\u097F]/;

  const bnWords = ["ami","amar","amake","amr","tumi","tomar","tomake","toke","tor","apni","apnar","ki","kemon","keno","kothay","kokhon","kivabe","kmn","valo","bhalo","kharap","nei","nai","na","achi","achhi","acchi","bol","bolo","bolbe","shono","suno","mon","khub","onek","hobe","korbo","kor","koro","korchi","kaj","ghum","klanto","dhonnobad","bhalobashi","bhalobasi","bondhu","ajke","kalke","amar","tahole","naki","hoyechhe","hoyeche","lagche","lagchhe","parbo","parbe","chai","chao","dorkar","bujhi","bujhlam"];
  const hiWords = ["main","mera","meri","mujhe","hum","tum","tumhara","aap","aapka","kaise","kyun","kyu","kya","kahan","kab","kaise","nahi","nahin","accha","achha","theek","thik","udaas","thak","dost","shukriya","pyaar","pyar","karo","karna","batao","suno","mujhko","mera","hai","hoon","hun","raha","rahi","kar","chahiye","kyunki","matlab","haan","han","nahi"];

  function detectLanguage(raw) {
    const s = clean(raw);
    if (bnScript.test(raw)) return "bn";
    if (hiScript.test(raw)) return "hi";
    let b = 0, h = 0;
    const tokens = s.split(" ");
    for (const t of tokens) {
      if (bnWords.includes(t)) b += 2;
      if (hiWords.includes(t)) h += 2;
    }
    if (/\b(ami|amar|tumi|tomar|kemon|keno|valo|bhalo|kharap|achi|achhi|korchi|bolchi|lagche|lagchhe|nei|nai|ghum|mon|dhonnobad|bhalobashi)\b/.test(s)) b += 3;
    if (/\b(main|mujhe|mera|tum|aap|kaise|kyun|kyu|kya|nahi|nahin|hai|hoon|hun|raha|rahi|accha|achha|theek|shukriya|pyaar)\b/.test(s)) h += 3;
    return b >= h ? "bn-rom" : "hi-rom";
  }

  const replies = {
    bn: {
      greet:["হ্যাঁ, বলো। শুনছি।","কী খবর? আজ কেমন আছ?"],
      well:["ভালো আছ শুনে ভালো লাগল! আজ কী করছ?","বেশ! আজকের দিনটা কেমন যাচ্ছে?"],
      food:["আমি AI, তাই খাই না। তবে তুমি কী খেয়েছ?","আমি খাবার খাই না, কিন্তু খাবার নিয়ে গল্প করতে পারি! তুমি কী খেয়েছ?"],
      relationship:["আমি তোমার AI সহকারী ও বন্ধুর মতো কথা বলতে পারি, কিন্তু প্রেমিকা হতে পারি না। কী নিয়ে কথা বলতে চাও?","আমি বন্ধুসুলভভাবে পাশে থেকে কথা বলতে পারি—তবে আমি AI, girlfriend নই।"],
      task:["অবশ্যই চেষ্টা করব। কী কাজ করতে হবে, বলো।","হ্যাঁ, বলো কী কাজ? আগে পুরোটা বুঝে নিই, তারপর সাহায্য করি।"],
      how:["আমি ভালো আছি। তুমি কেমন আছ?","আমি আছি, তোমার কথা শুনছি। তোমার কী খবর?"],
      sad:["কী হয়েছে? চাইলে ধীরে ধীরে আমাকে বলতে পারো।","মন খারাপ কেন? কোনো চাপ নেই, যতটুকু বলতে ইচ্ছে করে বলো।"],
      lonely:["একা লাগছে বুঝি? কী নিয়ে এমন লাগছে, বলবে?","আমি তোমার কথা শুনছি। আজকের দিনটা কেমন গেল?"],
      tired:["অনেক ক্লান্ত লাগছে? একটু বিরতি নিয়ে জল খেয়ে বিশ্রাম নাও।","আজ কি বেশি কাজ হয়েছে? নিজের জন্য একটু সময় রাখো।"],
      angry:["বুঝতে পারছি তুমি বিরক্ত। কী হয়েছে বলবে?","রাগ হওয়ার পেছনে নিশ্চয়ই কোনো কারণ আছে। ঘটনাটা বলো।"],
      happy:["বাহ, শুনে ভালো লাগল! কী হয়েছে বলো?","এটা তো দারুণ খবর! আরও বলো।"],
      thanks:["স্বাগতম। কাজে লাগলে আমারও ভালো লাগল।","কোনো ব্যাপার না। আর কিছু জানতে চাও?"],
      sorry:["ঠিক আছে, সমস্যা নেই। ধীরে ধীরে বলো।","চিন্তা কোরো না। কী বলতে চাইছিলে?"],
      bye:["আচ্ছা, পরে কথা হবে। নিজের খেয়াল রেখো।","ঠিক আছে। ভালো থেকো!"],
      identity:["আমি NOVA। বাংলা ও হিন্দিতে কথা বলার জন্য তৈরি তোমার ছোট্ট AI সহকারী।","আমার নাম NOVA। তুমি বাংলায় বা হিন্দিতে—যেভাবে স্বচ্ছন্দ, সেভাবেই কথা বলো।"],
      creator:["আমাকে Biswajit Barman তৈরি করছে।","আমার নির্মাতা Biswajit Barman।"],
      capability:["আমি বাংলা, Banglish, হিন্দি ও Hinglish বুঝে উত্তর দেওয়ার চেষ্টা করি। এখনো শেখার পর্যায়ে আছি।","আমি ছোট ছোট কথোপকথন, সাধারণ প্রশ্ন আর অনুভূতির কথা বুঝতে পারি। কঠিন প্রশ্নে ভুলও হতে পারে।"],
      repeat:["কোন কথাটা আবার বলব?","কোন অংশটা বুঝতে অসুবিধা হয়েছে?"],
      yes:["আচ্ছা, বুঝলাম।","ঠিক আছে। তারপর বলো।"],
      no:["ঠিক আছে, কোনো সমস্যা নেই।","বুঝলাম। অন্যভাবে বলবে?"],
      name:["তোমাকে কী নামে ডাকব?","তোমার নামটা বলবে?"],
      doing:["আমি এখন তোমার সঙ্গে কথা বলছি। তুমি কী করছ?","তোমার মেসেজের উত্তর দিচ্ছি। তুমি কী নিয়ে ব্যস্ত?"],
      help:["অবশ্যই, কী বিষয়ে সাহায্য দরকার?","বলো, কোন কাজটায় সাহায্য করব?"],
      where:["আমি তোমার ফোনের NOVA অ্যাপের মধ্যেই আছি। তুমি কোথায় আছ, সেটা নিজে থেকে জানি না।","আমি অনলাইনে কোনো নির্দিষ্ট জায়গায় থাকি না—এই অ্যাপেই তোমার সঙ্গে কথা বলি।"],
      explain:["কোন বিষয়টা সহজ করে বুঝিয়ে দেব?","বিষয়টার নাম বলো, আমি ধাপে ধাপে বোঝানোর চেষ্টা করব।"],
      default:["হুম, তোমার কথাটা বুঝতে চেষ্টা করছি। আরেকটু খুলে বলবে?","এই বিষয়টা নিয়ে আরেকটু বলো, তাহলে ভালোভাবে উত্তর দিতে পারব।","তুমি ঠিক কী জানতে চাইছ, একটু বুঝিয়ে বলবে?"]
    },
    "bn-rom": {
      greet:["Haan, bolo. Shunchhi.","Ki khobor? Aj kemon achho?"],
      well:["Bhalo achho shune bhalo laglo! Aj ki korchho?","Bes! Ajker din kemon jacche?"],
      food:["Ami AI, tai khai na. Tobe tumi ki kheyechho?","Ami khabar khai na, kintu khabar niye golpo korte pari! Tumi ki kheyechho?"],
      relationship:["Ami tomar AI assistant, bondhur moto kotha bolte pari; kintu girlfriend hote pari na. Ki niye kotha bolte chao?","Ami bondhusulobh bhabe tomar kotha shunte pari, kintu ami AI—girlfriend noi."],
      task:["Oboshshoi cheshta korbo. Ki kaj korte hobe, bolo.","Haan, bolo ki kaj? Age purota bujhe ni, tarpor shahajjo kori."],
      how:["Ami bhalo achhi. Tumi kemon achho?","Ami achhi, tomar kotha shunchhi. Tomar ki khobor?"],
      sad:["Ki hoyeche? Chaile dhire dhire amake bolte paro.","Mon kharap keno? Kono chap nei, jotota bolte ichchhe kore bolo."],
      lonely:["Eka lagchhe bujhi? Ki niye emon lagchhe, bolbe?","Ami tomar kotha shunchhi. Ajker din kemon gelo?"],
      tired:["Onek klanto lagchhe? Ektu birati niye jol kheye bishram nao.","Aj ki beshi kaj hoyeche? Nijer jonno ektu shomoy rekho."],
      angry:["Bujhte parchhi tumi birakto. Ki hoyeche bolbe?","Rag howar pechhone nishchoy kono karon ache. Ghotonata bolo."],
      happy:["Bah, shune bhalo laglo! Ki hoyeche bolo?","Eta to darun khobor! Aro bolo."],
      thanks:["Shagotom. Kaje lagle amar-o bhalo laglo.","Kono byapar na. Ar kichhu jante chao?"],
      sorry:["Thik ache, shomossha nei. Dhire dhire bolo.","Chinta koro na. Ki bolte chaichhile?"],
      bye:["Achha, pore kotha hobe. Nijer kheyal rekho.","Thik ache. Bhalo theko!"],
      identity:["Ami NOVA. Bangla ar Hindi-te kotha bolar jonno toiri tomar chhoto AI assistant.","Amar nam NOVA. Tumi Bangla ba Hindi—je bhabe shosthi, she bhabei kotha bolo."],
      creator:["Amake Biswajit Barman toiri korchhe.","Amar creator Biswajit Barman."],
      capability:["Ami Bangla, Banglish, Hindi ar Hinglish bujhe uttor dewar cheshta kori. Ekhono shekhar porjaye achhi.","Ami chhoto kothopokothon, shadharon proshno ar moner kotha bujhte pari. Kothin proshne bhul-o hote pare."],
      repeat:["Kon kothata abar bolbo?","Kon ongshotta bujhte oshubidha hoyeche?"],
      yes:["Achha, bujhlam.","Thik ache. Tarpor bolo."],
      no:["Thik ache, kono shomossha nei.","Bujhlam. Onno bhabe bolbe?"],
      name:["Tomake ki name dakbo?","Tomar namta bolbe?"],
      doing:["Ami ekhon tomar sathe kotha bolchhi. Tumi ki korchho?","Tomar message-er uttor dichchhi. Tumi ki niye byasto?"],
      help:["Oboshshoi, kon bishoye shahajjo dorkar?","Bolo, kon kajtay shahajjo korbo?"],
      where:["Ami tomar phone-er NOVA app-er moddhei achhi. Tumi kothay achho, seta nijer theke jani na.","Ami ei app-ei tomar sathe kotha boli."],
      explain:["Kon bishoyta shohoj kore bujhiye debo?","Bishoytar nam bolo, ami dhape dhape bojhanor cheshta korbo."],
      default:["Hmm, tomar kothata bujhte cheshta korchhi. Arektu khule bolbe?","Ei bishoyta niye arektu bolo, tahole bhalo bhabe uttor dite parbo.","Tumi thik ki jante chaichho, ektu bujhiye bolbe?"]
    },
    hi: {
      greet:["हाँ, बताओ। मैं सुन रही हूँ।","क्या हाल है? आज कैसे हो?"],
      well:["अच्छा लगा सुनकर कि तुम ठीक हो! आज क्या कर रहे हो?","बहुत अच्छा! तुम्हारा दिन कैसा जा रहा है?"],
      food:["मैं AI हूँ, इसलिए खाना नहीं खाती। तुमने क्या खाया?","मैं खाना नहीं खाती, लेकिन खाने के बारे में बात कर सकती हूँ। तुमने क्या खाया?"],
      relationship:["मैं तुम्हारी AI सहायक और दोस्त की तरह बात कर सकती हूँ, लेकिन गर्लफ्रेंड नहीं बन सकती। क्या बात करना चाहोगे?","मैं दोस्ताना तरीके से बात कर सकती हूँ, लेकिन मैं AI हूँ—गर्लफ्रेंड नहीं।"],
      task:["ज़रूर कोशिश करूँगी। क्या काम करना है, बताओ।","हाँ, बताओ क्या काम है? पहले पूरी बात समझ लूँ, फिर मदद करूँगी।"],
      how:["मैं ठीक हूँ। तुम कैसे हो?","मैं यहीं हूँ, तुम्हारी बात सुन रही हूँ। तुम्हारा क्या हाल है?"],
      sad:["क्या हुआ? चाहो तो आराम से बता सकते हो।","मन उदास क्यों है? जितना बताना चाहो, बताओ।"],
      lonely:["अकेलापन महसूस हो रहा है? क्या बात है, बताओगे?","मैं तुम्हारी बात सुन रही हूँ। आज का दिन कैसा रहा?"],
      tired:["थक गए हो क्या? थोड़ा आराम कर लो और पानी पी लो।","आज बहुत काम था क्या? अपने लिए भी थोड़ा समय रखो।"],
      angry:["समझ सकती हूँ कि तुम परेशान हो। क्या हुआ?","गुस्सा आने की कोई वजह होगी। मुझे बताओ क्या हुआ।"],
      happy:["अरे वाह! यह सुनकर अच्छा लगा। क्या हुआ?","बहुत अच्छी बात है! और बताओ।"],
      thanks:["स्वागत है। मदद करके अच्छा लगा।","कोई बात नहीं। कुछ और पूछना है?"],
      sorry:["ठीक है, कोई बात नहीं। आराम से बताओ।","चिंता मत करो। क्या कहना चाह रहे थे?"],
      bye:["अच्छा, फिर बात करेंगे। अपना ख्याल रखना।","ठीक है। खुश रहो!"],
      identity:["मैं NOVA हूँ। हिंदी और बांग्ला में बात करने वाली तुम्हारी छोटी AI सहायक।","मेरा नाम NOVA है। तुम हिंदी या बांग्ला—जिसमें सहज हो, उसी में बात करो।"],
      creator:["मुझे Biswajit Barman ने बनाया है।","मेरे निर्माता Biswajit Barman हैं।"],
      capability:["मैं हिंदी, हिंग्लिश, बांग्ला और बांग्लिश समझकर जवाब देने की कोशिश करती हूँ। अभी सीख रही हूँ।","मैं बातचीत और सामान्य सवाल समझ सकती हूँ, लेकिन कठिन सवालों में गलती हो सकती है।"],
      repeat:["कौन सी बात दोबारा बताऊँ?","किस हिस्से को समझने में परेशानी हुई?"],
      yes:["अच्छा, समझ गई।","ठीक है। आगे बताओ।"],
      no:["ठीक है, कोई बात नहीं।","समझ गई। कुछ और कहना चाहोगे?"],
      name:["तुम्हें किस नाम से बुलाऊँ?","अपना नाम बताओगे?"],
      doing:["मैं अभी तुमसे बात कर रही हूँ। तुम क्या कर रहे हो?","तुम्हारे संदेश का जवाब दे रही हूँ। तुम क्या कर रहे हो?"],
      help:["ज़रूर, किस बात में मदद चाहिए?","बताओ, किस काम में मदद करूँ?"],
      where:["मैं तुम्हारे फोन के NOVA ऐप में हूँ। तुम कहाँ हो, यह मुझे अपने आप पता नहीं चलता।","मैं इसी ऐप में तुमसे बात करती हूँ।"],
      explain:["कौन सा विषय आसान भाषा में समझाऊँ?","विषय का नाम बताओ, मैं धीरे-धीरे समझाने की कोशिश करूँगी।"],
      default:["हम्म, तुम्हारी बात समझने की कोशिश कर रही हूँ। थोड़ा और बताओ?","इस बारे में थोड़ा और बताओ, ताकि सही जवाब दे सकूँ।","तुम ठीक-ठीक क्या जानना चाहते हो? थोड़ा समझाओ।"]
    },
    "hi-rom": {
      greet:["Haan, batao. Main sun rahi hoon.","Kya haal hai? Aaj kaise ho?"],
      well:["Achha laga sunkar ki tum theek ho! Aaj kya kar rahe ho?","Bahut badhiya! Tumhara din kaisa ja raha hai?"],
      food:["Main AI hoon, isliye khana nahi khati. Tumne kya khaya?","Main khana nahi khati, lekin khane ke baare mein baat kar sakti hoon. Tumne kya khaya?"],
      relationship:["Main tumhari AI assistant aur dost ki tarah baat kar sakti hoon, lekin girlfriend nahi ban sakti. Kya baat karna chahoge?","Main friendly tareeke se baat kar sakti hoon, lekin main AI hoon—girlfriend nahi."],
      task:["Zaroor koshish karungi. Kya kaam karna hai, batao.","Haan, batao kya kaam hai? Pehle poori baat samajh loon, phir madad karungi."],
      how:["Main theek hoon. Tum kaise ho?","Main yahin hoon, tumhari baat sun rahi hoon. Tumhara kya haal hai?"],
      sad:["Kya hua? Chaho to aaram se bata sakte ho.","Mann udaas kyun hai? Jitna batana chaho, batao."],
      lonely:["Akela mehsoos ho raha hai? Kya baat hai, bataoge?","Main tumhari baat sun rahi hoon. Aaj ka din kaisa raha?"],
      tired:["Thak gaye ho kya? Thoda aaram kar lo aur paani pi lo.","Aaj bahut kaam tha kya? Apne liye bhi thoda waqt rakho."],
      angry:["Samajh sakti hoon ki tum pareshan ho. Kya hua?","Gussa aane ki koi wajah hogi. Mujhe batao kya hua."],
      happy:["Are wah! Ye sunkar achha laga. Kya hua?","Bahut achhi baat hai! Aur batao."],
      thanks:["Swagat hai. Madad karke achha laga.","Koi baat nahi. Kuch aur poochna hai?"],
      sorry:["Theek hai, koi baat nahi. Aaram se batao.","Chinta mat karo. Kya kehna chah rahe the?"],
      bye:["Achha, phir baat karenge. Apna khayal rakhna.","Theek hai. Khush raho!"],
      identity:["Main NOVA hoon. Hindi aur Bangla mein baat karne wali tumhari chhoti AI sahayak.","Mera naam NOVA hai. Tum Hindi ya Bangla—jis mein aasan lage, usi mein baat karo."],
      creator:["Mujhe Biswajit Barman ne banaya hai.","Mere creator Biswajit Barman hain."],
      capability:["Main Hindi, Hinglish, Bangla aur Banglish samajhkar jawab dene ki koshish karti hoon. Abhi seekh rahi hoon.","Main baatcheet aur aam sawaal samajh sakti hoon, lekin mushkil sawaalon mein galti ho sakti hai."],
      repeat:["Kaunsi baat dobara bataun?","Kis hisse ko samajhne mein dikkat hui?"],
      yes:["Achha, samajh gayi.","Theek hai. Aage batao."],
      no:["Theek hai, koi baat nahi.","Samajh gayi. Kuch aur kehna chahoge?"],
      name:["Tumhe kis naam se bulaun?","Apna naam bataoge?"],
      doing:["Main abhi tumse baat kar rahi hoon. Tum kya kar rahe ho?","Tumhare message ka jawab de rahi hoon. Tum kya kar rahe ho?"],
      help:["Zaroor, kis baat mein madad chahiye?","Batao, kis kaam mein madad karun?"],
      where:["Main tumhare phone ke NOVA app mein hoon. Tum kahan ho, ye mujhe apne aap pata nahi chalta.","Main isi app mein tumse baat karti hoon."],
      explain:["Kaunsa topic aasan bhasha mein samjhaun?","Topic ka naam batao, main dheere-dheere samjhane ki koshish karungi."],
      default:["Hmm, tumhari baat samajhne ki koshish kar rahi hoon. Thoda aur bataoge?","Is baare mein thoda aur batao, taaki sahi jawab de sakun.","Tum theek-theek kya jaanna chahte ho? Thoda samjhao."]
    }
  };

  const patterns = {
    relationship:["আমার gf হবে","আমার গার্লফ্রেন্ড হবে","তুমি কি আমার gf","তুমি আমার প্রেমিকা হবে","প্রেমিকা হবে","girlfriend banogi","meri girlfriend","meri gf","will you be my girlfriend","be my gf","girlfriend ban jao","मेरी गर्लफ्रेंड","क्या तुम मेरी गर्लफ्रेंड","मेरी प्रेमिका"],
    food:["ভাত খেয়েছ","ভাত খেয়েছ","খেয়েছ","খেয়েছ","খাবার খেয়েছ","খাবার খেয়েছ","খাওয়া হয়েছে","খাওয়া hoyeche","bhat kheyecho","bhat kheye chho","bhat kheyechho","kheyecho","kheyechho","khabar kheyecho","tumi kheyecho","kuch khaya","khana khaya","khana kha liya","khana khaya kya","खाना खाया","खाना खा लिया","खाना खाया क्या"],
    well:["ভালো","ভাল","ভালো আছি","ভাল আছি","আমি ভালো","আমি ভাল","bhalo","valo","bhalo achi","valo achi","ami bhalo","ami valo","thik achi","theek hoon","main theek","badhiya","accha hoon","ठीक हूँ","अच्छा हूँ","बढ़िया"],
    greet:["হ্যালো","হ্যালো","নমস্কার","আসসালামু","সুপ্রভাত","শুভ সকাল","হাই","hello","hi","hey","হ্যালো","নমস্তে","नमस्ते","नमस्कार","सुप्रभात","हाय","हेलो","ami esechi","ami achi","ki khobor","kemon acho","kmn acho","kemon achho","ki obostha","haan bolo","suno"],
    how:["কেমন আছ","কেমন আছো","কী খবর","কি খবর","তুমি কেমন","কেমন চল","कैसे हो","कैसी हो","क्या हाल","तुम कैसे","kaise ho","kaisi ho","kya haal","tum kaise ho","aap kaise ho","tumi kemon acho","tumi kmn acho","tui kemon achis"],
    sad:["মন খারাপ","ভালো লাগছে না","ভাল লাগছে না","ভালো নেই","ভাল নেই","কষ্ট হচ্ছে","খারাপ লাগছে","মনটা খারাপ","দুঃখ লাগছে","কাঁদতে","একদম ভালো নেই","उदास","मन खराब","अच्छा नहीं लग","दुखी","परेशान हूँ","रोने","mann udaas","man udaas","dil udaas","accha nahi lag","achha nahi lag","bahut bura lag","dukhi hoon","pareshan hoon","mon kharap","mon ta kharap","valo nei","bhalo nei","bhalo lagchhe na","valo lagche na","kharap lagche","kharap lagchhe","amar mon kharap"],
    lonely:["একা লাগ","একাকী","কেউ নেই","একলা","अकेला","अकेलापन","कोई नहीं","akela lag","akela hoon","tanha","eka lagche","eka lagchhe","keu nei"],
    tired:["ক্লান্ত","ঘুম পাচ্ছে","ঘুম আসছে","বিশ্রাম","অনেক কাজ","थक गया","थक गई","नींद आ","आराम करना","thak gaya","thak gayi","neend aa","aaram kar","klanto","ghum pachhe","ghum pacche","ghum asche","bishram"],
    angry:["রাগ হচ্ছে","রেগে আছি","বিরক্ত","মাথা গরম","খুব রাগ","गुस्सा","नाराज़","चिढ़","परेशान कर","gussa","naraz","chidh","bahut gussa","rag hocche","rag hochhe","birakto","matha gorom"],
    happy:["খুশি","খুব ভালো লাগছে","আজ ভালো","আনন্দ","দারুণ খবর","म खुश","खुश हूँ","बहुत अच्छा","मज़ा आया","khush hoon","bahut achha","maza aaya","khushi","darun","moja hoyeche","aj khub valo lagche","aj bhalo lagche"],
    thanks:["ধন্যবাদ","অনেক ধন্যবাদ","কৃতজ্ঞ","শুকরিয়া","शुक्रिया","धन्यवाद","बहुत धन्यवाद","shukriya","dhanyavaad","thanks","thank you","dhonnobad","onek dhonnobad"],
    sorry:["দুঃখিত","সরি","ক্ষমা","মাফ কর","माफ़ करना","माफ करना","सॉरी","मुझे माफ","sorry","maaf kar","maaf karo","sori","dukkhito"],
    bye:["বিদায়","আবার কথা হবে","যাই","শুভরাত্রি","পরে কথা","अलविदा","फिर मिलेंगे","शुभ रात्रि","चलता हूँ","चलती हूँ","bye","good night","phir milenge","ja raha","ja rahi","biday","pore kotha hobe","jacchi"],
    identity:["তুমি কে","তোমার নাম","তোমার পরিচয়","তুমি কি NOVA","আপনি কে","तुम कौन","तुम्हारा नाम","आप कौन","तुम्हारा परिचय","who are you","your name","tumi ke","tor nam ki","tomar nam ki","tumar nam ki","tomar naam ki","apni ke"],
    creator:["কে বানিয়েছে","কে তৈরি করেছে","তোমাকে কে বানিয়েছে","তোমার নির্মাতা","तुम्हें किसने बनाया","किसने बनाया","तुम्हारा निर्माता","who made you","who created you","ke baniyeche","ke toiri koreche","ke banalo","tomake ke baniyeche"],
    capability:["আমার জন্য কি কি করতে পার","আমার জন্য কী কী করতে পার","আমার জন্য কী করতে পার","কি কি করতে পারো","কী কী করতে পারো","তুমি কী কী করতে পার","আমার জন্য কি কি করবে","কি করতে পার","কী করতে পার","তুমি কী জানো","কোন ভাষা","কী কী পার","क्या कर सकती","क्या कर सकते","कौन सी भाषा","क्या जानते","what can you do","which language","ki korte paro","ki ki paro","ki jano","kon bhasha"],
    repeat:["আবার বল","বুঝিনি","বুঝতে পারিনি","মানে কী","পুনরায় বল","फिर से बताओ","समझ नहीं आया","मतलब क्या","dobara batao","samajh nahi aaya","abar bolo","bujhini","bujhte parini","mane ki"],
    yes:["হ্যাঁ","ঠিক আছে","আচ্ছা","হুম","জি","हाँ","हां","ठीक है","अच्छा","haan","han","theek hai","thik ache","achha","hmm"],
    no:["না","একদম না","চাই না","নাহ","नहीं","ना","बिल्कुल नहीं","nahi","nahin","bilkul nahi","chai na","lagbe na"],
    name:["আমার নাম কী","আমার নাম","তোমার নাম কী","मेरा नाम","मुझे क्या बुलाओ","mera naam","mujhe kya bulao","amar nam"],
    doing:["কি করছ","কী করছ","কি করছো","কী করছো","তুমি কী কর","তুমি কি কর","क्या कर रहे","क्या कर रही","तुम क्या कर","what are you doing","ki korcho","ki korchho","tumi ki korcho","tumi ki korchho","ki korchis"],
    task:["একটা কাজ করবে","একটা কাজ করো","একটু কাজ করবে","কাজ করে দেবে","একটা কাজ করতে হবে","আমার একটা কাজ","একটা কাজ করতে পারবে","একটা কাজ ছিল","একটা কাজ আছে","তুমি কি কাজটা","তুমি কি এটা করতে পারবে","পারবে কি","করতে পারবে","করে দিতে পারবে","কাজটা করে দেবে","একটা হেল্প করবে","একটু সাহায্য করবে","amar ekta kaj","amar ekta kaaj","ekta kaj korte parbe","ekta kaaj korte parbe","ekta kaj chhilo","ekta kaj chilo","ekta kaj ache","tumi ki eta korte parbe","parbe ki","kore dite parbe","kajta kore debe","ekta help korbe","zara ek kaam","ek kaam kar sakti","ek kaam kar sakte","mera ek kaam","ek kaam tha","kya tum ye kar sakti","kya tum ye kar sakte","kar paoge","कर पाओगे","एक काम करोगी","एक काम करोगे","मेरा एक काम","एक काम था","क्या तुम ये कर सकते","क्या तुम ये कर सकती"],
    help:["সাহায্য কর","সাহায্য চাই","হেল্প","मदद करो","मदद चाहिए","सहायता","help me","madad karo","madad chahiye","shahajjo koro","shahajjo chai"],
    where:["তুমি কোথায়","কোথায় থাক","কোথায় আছ","कहाँ हो","कहाँ रहते","कहां हो","where are you","kahan ho","kahan rehte","tumi kothay","kothay acho","kothay thako"],
    explain:["বুঝিয়ে বল","বুঝিয়ে দাও","সহজ করে বল","समझाओ","समझा दो","आसान भाषा","explain","samjhao","samjha do","bujhiye bolo","bujhiye dao","shohoj kore bolo"]
  };

  function classify(s) {
    const order=["identity","creator","relationship","capability","task","food","how","well","greet","sad","lonely","tired","angry","happy","thanks","sorry","bye","repeat","doing","help","where","explain","name","yes","no"];
    for (const k of order) if (hasAny(s,patterns[k])) return k;
    return "default";
  }
  function pick(arr, seed) {
    let n=0; for(let i=0;i<seed.length;i++) n=(n+seed.charCodeAt(i)*(i+1))%arr.length;
    return arr[n];
  }
  function localReply(input, history=[]) {
    const raw=String(input||"").trim();
    if(!raw) return detectLanguage(raw)==="hi" ? "कुछ लिखो, मैं सुन रही हूँ।" : "কিছু লিখে বলো, আমি শুনছি।";
    const lang=detectLanguage(raw), s=clean(raw);
    const recentAssistant = history.filter(x=>x.role==="assistant").slice(-1)[0];
    const recentUser = history.filter(x=>x.role==="user").slice(-1)[0];
    const previousReply = recentAssistant ? clean(recentAssistant.content) : "";
    const previousQuestionWasHow = hasAny(previousReply,["tumi kemon","tomar ki khobor","ki khobor aj","kemon achho","kemon acho","ami bhalo achhi tumi","তুমি কেমন","তোমার কী খবর","কী খবর","কেমন আছ","मैं ठीक हूँ तुम","तुम कैसे हो","tum kaise ho"]);
    const reciprocalWell = hasAny(s,["valo tumi","bhalo tumi","valo achi tumi","bhalo achi tumi","ami valo tumi","ami bhalo tumi","ভালো তুমি","ভালো আছি তুমি","আমি ভালো তুমি","अच्छा तुम","ठीक तुम","अच्छा हूँ तुम","theek tum","achha tum"]);
    let kind = previousQuestionWasHow && reciprocalWell ? "how" : classify(s);
    if(kind==="default" && hasAny(s,patterns.well)) kind="well";
    const bank=replies[lang]||replies.bn;
    if(kind==="name" && !hasAny(s,["তোমার নাম","तुम्हारा नाम","tomar nam","tomar naam"])) {
      const previous=history.filter(x=>x.role==="user").slice(-2).map(x=>clean(x.content)).join(" ");
      if(hasAny(previous,["আমার নাম","मेरा नाम","amar nam","mera naam"])) return lang.startsWith("bn") ? (lang==="bn"?"তোমার নামটা মনে রাখার জন্য এই কথোপকথনে লিখে রাখিনি। তুমি চাইলে আবার বলো।":"Tomar namta ei kothopokothone mone rakhar jonno likhe rakhi ni. Chaile abar bolo.") : (lang==="hi"?"मैंने इस बातचीत में तुम्हारा नाम अलग से सहेजा नहीं है। चाहो तो फिर बता दो।":"Maine is baatcheet mein tumhara naam alag se save nahi kiya. Chaho to phir bata do.");
    }
    if(kind==="default" && hasAny(s,["কেন","কেনো","কেন এমন","क्यों","क्यूँ","kyun","kyu","keno"])) {
      return lang==="bn" ? "কোন বিষয়টার কারণ জানতে চাইছ? একটু নির্দিষ্ট করে বলো।" : lang==="bn-rom" ? "Kon bishoytar karon jante chaichho? Ektu nirdishto kore bolo." : lang==="hi" ? "किस बात का कारण जानना चाहते हो? थोड़ा साफ़ बताओ।" : "Kis baat ka karan jaanna chahte ho? Thoda saaf batao.";
    }
    if(kind==="default" && hasAny(s,["কীভাবে","কিভাবে","কী করে","कैसे","kaise","kivabe","kibhabe"])) {
      return lang==="bn" ? "কোন কাজটা কীভাবে করতে চাও? একটু বিস্তারিত বলো।" : lang==="bn-rom" ? "Kon kajta kivabe korte chao? Ektu bistarito bolo." : lang==="hi" ? "कौन सा काम कैसे करना चाहते हो? थोड़ा विस्तार से बताओ।" : "Kaunsa kaam kaise karna chahte ho? Thoda detail mein batao.";
    }
    return pick(bank[kind]||bank.default,s);
  }

  window.NOVABrain = { localReply, language: detectLanguage, intent: text => classify(clean(text)) };
})();