// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { GAMES, GameShell, Profile, Rating, loadProfile, normalizeProfile, KEY, AVATARS } from "./Arena";
import { supabase } from "@/integrations/supabase/client";
import { cloudOn, signInGoogle, signOut, fetchProfile, saveProfile, fetchBoard } from "./cloud";
import { MORE_GAMES } from "./MoreGames";
import { NEW_GAMES, NEW_CSS } from "./NewGames";
import { THEME_CSS } from "./Theme";
import Explain from "./Explain";
import EmailAuth from "./EmailAuth";

const ALL = [...GAMES, ...MORE_GAMES, ...NEW_GAMES];

const EN = {
  "Bosh sahifa":"Home", "O'yinlar":"Games", "Vazifalar":"Tasks", "Reyting":"Leaderboard", "Yordamchi":"Assistant", "Profil":"Profile",
  "Xush kelibsan! 👋":"Welcome! 👋", "Ma'lumotlarni o'zgartirish":"Edit details",
  "O'ynashdan oldin o'zing haqingda ma'lumotlarni to'ldir.":"Fill in your details before playing.",
  "Google bilan kirish":"Continue with Google", "Google ishlamasa:":"If Google doesn't work:",
  "Natijalaring saqlanadi va istalgan qurilmada ochiladi. Google'siz davom etsang, natijalar faqat shu qurilmada qoladi.":"Your progress is saved and available on any device. Without Google, it stays on this device.",
  "Isming":"Your name", "Guruhing":"Your group", "Kichik guruh":"Junior group", "O'rta guruh":"Middle group", "Katta guruh":"Senior group",
  "3–5-sinf":"Grades 3–5", "6–9-sinf":"Grades 6–9", "10-sinf va 18–20 yosh":"Grade 10 and ages 18–20",
  "Tayyor! O'ynashni boshlash 🚀":"Done! Start playing 🚀", "Masalan: Aziza":"e.g. Alex", "Mehmon":"Guest",
  "Hisobdan chiqish":"Sign out", "Hisob ulangan:":"Account connected:", "Hisob:":"Account:",
  "Natijalaring faqat shu qurilmada. Saqlab qo'yish uchun hisobni ulang.":"Your progress is only on this device. Connect an account to back it up.",
  "Google bilan ulash":"Connect Google", "O'yin qidirish...":"Search games...", "Bunday o'yin topilmadi. Boshqa so'z bilan qidirib ko'r.":"No games found. Try another search.",
  "Kunlik vazifalar":"Daily tasks", "2 ta o'yin o'yna":"Play 2 games", "Bugun 60 XP yig'":"Earn 60 XP today", "1 ta xatosiz o'yin qil":"Finish one game without mistakes",
  "Olindi":"Claimed", "Vazifalar har kuni yangilanadi.":"Tasks refresh every day.", "Ketma-ket kun:":"Day streak:",
  "O'yna va o'rgan":"Play and learn", "O'yna, o'rgan va sinfdoshlaringdan o'zib ket!":"Play, learn, and climb above your classmates!",
  "O'yna.":"Play.", "O'rgan.":"Learn.", "G'olib bo'l!":"Win!",
  "Boshlash":"Get started", "O'yinlarga o'tish":"Go to games", "Reytingni ko'r":"View leaderboard",
  "Nimalar bor?":"What's inside?", "Kunlik vazifalar":"Daily tasks", "Sinf reytingi":"Class leaderboard",
  "Shaxsiy profil":"Personal profile", "Daraja va ketma-ket kunlar.":"Level, day streak, and progress.",
  "Guruhlar":"Groups", "Qanday ishlaydi?":"How it works?", "Ro'yxatdan o't":"Register", "O'yna":"Play", "Yuksal":"Level up",
  "Ko'p so'raladigan savollar":"Frequently asked questions", "Bog'lanish":"Contact",
  "Kimlar uchun?":"Who is it for?", "Telefonda ishlaydimi?":"Does it work on phones?",
  "Natijalarim saqlanadimi?":"Is my progress saved?", "Yangi o'yinlar qo'shiladimi?":"Will new games be added?",
  "✉️ Email bilan kirish":"✉️ Sign in with email", "Kirish":"Sign in", "Ro'yxatdan o'tish":"Create account",
  "Hisob ochish":"Create account", "Parolni unutdim":"Forgot password", "← Orqaga":"← Back",
  "Havola yuborish":"Send link", "Kuting...":"Please wait...", "Email":"Email", "Parol":"Password",
  "masalan: aziza@gmail.com":"e.g. alex@gmail.com", "kamida 6 belgi":"at least 6 characters",
  "Email manzilini to'g'ri yoz.":"Enter a valid email address.", "Parol kamida 6 belgidan iborat bo'lsin.":"Password must be at least 6 characters.",
  "Emailingga parolni tiklash havolasi yuborildi. 📬":"A password reset link has been sent to your email. 📬",
  "Emailingga tasdiqlash havolasi yuborildi. Havolani bosgach, shu sahifaga qaytasan. 📬":"A confirmation link has been sent to your email. Open it, then return to this page. 📬",
  "Hisob ulangan:":"Account connected:", "Hisobdan chiqish":"Sign out",
  "Mukammal!":"Perfect!", "Zo'r o'ynading!":"Well played!", "Yana o'ynash":"Play again",
  "Sinf reytingi":"Class leaderboard", "O'yinlar (":"Games (", "Bosh sahifa":"Home",
  "2 ta o'yin o'yna":"Play 2 games", "Bugun 60 XP yig'":"Earn 60 XP today", "1 ta xatosiz o'yin qil":"Complete one mistake-free game",
  "Vazifalar har kuni yangilanadi.":"Tasks refresh every day.", "Olindi":"Claimed",
  "Guruh va ismni o'zgartirish":"Change group and name", "Hisob:":"Account:",
  "Ur-so'zni":"Whack-a-word", "Xotira kartalari":"Memory cards", "Juftlashtir":"Match pairs", "Sudrab tashla":"Drag and drop",
  "Sichqoncha yoki barmoq bilan to'g'ri so'zni ur!":"Hit the correct word with your mouse or finger!",
  "Juftliklarni eslab qol va top.":"Remember and find the matching pairs.", "6 ta so'zni 6 ta tarjimaga ulang.":"Match 6 words with their 6 translations.",
  "So'zlarni rasmlarga sudrab joylashtir.":"Drag the words onto the pictures.", "O'yin qidirish...":"Search games...",
  "Kunlik vazifalar":"Daily tasks", "Yangi savollar":"New questions", "Bosh sahifa":"Home",
  "Urinish:":"Attempts:", "Xato:":"Mistakes:", "Yana o'ynash (yangi savollar)":"Play again (new questions)",
  "O'yin qidirish":"Search games", "O'yna va o'rgan":"Play and learn",
  "Sizning natijangiz":"Your result", "Natija":"Result", "To'g'ri javob":"Correct answer",
  "Keyingi":"Next", "Davom etish":"Continue", "Boshlash":"Start", "Tugatish":"Finish",
  "Qayta boshlash":"Restart", "Vaqt":"Time", "Ball":"Score", "Savol":"Question",
  "Javob":"Answer", "To'g'ri":"Correct", "Noto'g'ri":"Incorrect", "Ajoyib!":"Excellent!",
  "Yana urinib ko'r":"Try again", "Tayyor":"Ready", "Tanla":"Choose",
  "So'z tushmasdan oldin to'g'ri savatni bos":"Tap the correct basket before the word falls",
  "Qaysi biri ortiqcha":"Which one is different", "Qaysi rangda":"Which color",
  "The {A.n} is":"The {A.n} is", "Where is the":"Where is the",
  "Ha. Sayt telefon, planshet va kompyuterda bir xil qulay ishlaydi.":"Yes. The site works smoothly on phones, tablets, and computers.",
  "Ha. O'yinlar soni muntazam ko'paytiriladi, har safar savollar yangilanib turadi.":"Yes. More games are added regularly, and questions refresh each time.",
  "Ismingiz":"Your name", "Savol yoki taklifingiz":"Your question or suggestion", "Yuborish":"Send",
  "Rahmat! Xabaringiz qabul qilindi. ✅":"Thank you! Your message has been received. ✅",
  "Yuklanmoqda...":"Loading...", "O'yin qidirish":"Search games", "Bosh sahifa":"Home",
  "O'zbekcha":"Uzbek", "English":"English", "Til":"Language",
  "Chapdan tanla, o'ngdan juftini bos.":"Choose on the left, then tap its match on the right.",
  "Keyingi darajagacha":"Until next level", "Kun ketma-ket":"Day streak", "Daraja":"Level", "Sinf reytingi":"Class leaderboard",
  "Inglizcha:":"English:", "Uzbekcha:":"Uzbek:", "Rasm:":"Picture:", "— inglizchasini bos!":"— tap its English word!",
  "— inglizcha so'zini bos!":"— tap the English word!", "— o'zbekchasini bos!":"— tap the Uzbek translation!",
  "← Orqaga":"← Back", "🔄 Yangi savollar":"🔄 New questions", "🔄 Yana o'ynash (yangi savollar)":"🔄 Play again (new questions)",
  "O'tkazib yubor":"Skip", "Tekshir":"Check", "Tozalash":"Clear", "🔊 Tingla":"🔊 Listen", "🔊 Eshit":"🔊 Listen",
  "Inglizchaga o'gir:":"Translate into English:", "Inglizchasini yoz":"Write it in English", "Ko'chirib yoz:":"Copy and write:",
  "Bu rasm":"This picture", "degani to'g'rimi?":"Does this mean?", "✔ Ha":"✔ Yes", "✖ Yo'q":"✖ No",
  "top va bos":"Find and tap", "xato so'zni":"the incorrect word", "Soat nechchi?":"What time is it?",
  "Raqam bilan yoz:":"Write it as a number:", "Darajani tanla":"Choose a level", "Gapdagi":"In the sentence",
  "Gaplarni to'g'ri tartibda bos":"Tap the sentences in the correct order", "O'tgan zamon shaklini yoz (V2)":"Write the past-tense form (V2)",
  "Qaysi biri":"Which one", "Qaysi soat":"Which clock", "So'z tushmasdan oldin to'g'ri savatni bos":"Tap the correct basket before the word falls",
  "So'z yordamchisi":"Word assistant", "Misol:":"Example:", "Tushuntir ✨":"Explain ✨", "O'ylayapman... ⏳":"Thinking... ⏳",
  "Yordamchidan foydalanish uchun Google bilan kir.":"Sign in with Google to use the assistant.",
  "Inglizcha so'z yoki gap yoz — o'zbekcha tushuntirib, misol bilan ko'rsatib beraman.":"Enter an English word or sentence for an Uzbek explanation and an example.",
  "O'yin":"Game", "O'yinlar":"Games", "Bosh sahifa":"Home", "Orqaga":"Back",
  "Yangi o'quvchi":"New student", "Avatar tanla":"Choose an avatar",
  "Oddiy so'zlar, rasmlar va qisqa o'yinlar. Hayvonlar, ranglar, mevalar.":"Simple words, pictures, and short games about animals, colors, and fruit.",
  "Ko'proq so'z, gap tuzish, yozish va eshitib tushunish.":"More vocabulary, sentence building, writing, and listening comprehension.",
  "Tezkor o'yinlar, poygalar va sinfdoshlar bilan reyting kurashi.":"Fast games, races, and leaderboard competition with classmates.",
  "3-sinf o'quvchilaridan 18–20 yoshgacha bo'lgan o'quvchilar uchun. Har kim o'z guruhini tanlaydi.":"For students from grade 3 to ages 18–20. Everyone chooses their group.",
  "Ha. Google hisobing bilan kirsang, XP, daraja va vazifalar hisobingda saqlanadi va istalgan qurilmada ochiladi. Mehmon sifatida kirsang, natijalar faqat shu qurilmada qoladi.":"Yes. Sign in with Google to save XP, levels, and tasks to your account and access them on any device. Guest progress stays on this device."
};
const translateText = (value) => {
  let result = value;
  for (const [uz, en] of Object.entries(EN)) result = result.replaceAll(uz, en);
  return result;
};
function applyLanguage(root, lang) {
  if (!root) return;
  document.documentElement.lang = lang === "en" ? "en" : "uz";
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const raw = node.nodeValue || "";
    if (lang === "en") {
      const translated = translateText(raw);
      if (translated !== raw) node.nodeValue = translated;
    } else {
      // Uzbek is the source language; preserve React's original strings after switching back.
      // The page is reloaded to restore source copy without losing the selected language.
    }
  }
  root.querySelectorAll("input,textarea,button,[aria-label]").forEach((el) => {
    for (const attr of ["placeholder", "aria-label", "title"]) {
      const v = el.getAttribute(attr);
      if (v && lang === "en") el.setAttribute(attr, translateText(v));
    }
  });
}
const GROUPS = [
  { id: "kichik", name: "Kichik guruh", age: "3–5-sinf", emoji: "🌱", text: "Oddiy so'zlar, rasmlar va qisqa o'yinlar. Hayvonlar, ranglar, mevalar." },
  { id: "orta", name: "O'rta guruh", age: "6–9-sinf", emoji: "🌿", text: "Ko'proq so'z, gap tuzish, yozish va eshitib tushunish." },
  { id: "katta", name: "Katta guruh", age: "10-sinf va 18–20 yosh", emoji: "🌳", text: "Tezkor o'yinlar, poygalar va sinfdoshlar bilan reyting kurashi." },
];
const FAQ = [
  ["Kimlar uchun?", "3-sinf o'quvchilaridan 18–20 yoshgacha bo'lgan o'quvchilar uchun. Har kim o'z guruhini tanlaydi."],
  ["Telefonda ishlaydimi?", "Ha. Sayt telefon, planshet va kompyuterda bir xil qulay ishlaydi."],
  ["Natijalarim saqlanadimi?", "Ha. Google hisobing bilan kirsang, XP, daraja va vazifalar hisobingda saqlanadi va istalgan qurilmada ochiladi. Mehmon sifatida kirsang, natijalar faqat shu qurilmada qoladi."],
  ["Yangi o'yinlar qo'shiladimi?", "Ha. O'yinlar soni muntazam ko'paytiriladi, har safar savollar yangilanib turadi."],
];

// Sahifa manzili "#/..." ko'rinishida. Google'dan qaytishda manzilda vaqtincha
// "#access_token=..." bo'ladi: uni sahifa deb hisoblamaymiz.
const readHash = () => { const h = location.hash.slice(1); return h.startsWith("/") ? h : "/"; };
function useHash() {
  const [h, setH] = useState(readHash);
  useEffect(() => {
    const f = () => setH(readHash());
    window.addEventListener("hashchange", f);
    window.addEventListener("popstate", f);
    return () => { window.removeEventListener("hashchange", f); window.removeEventListener("popstate", f); };
  }, []);
  return h;
}
const go = (to) => { location.hash = to; window.scrollTo(0, 0); };

function Landing({ p }) {
  const [open, setOpen] = useState(null);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState({ name: "", text: "" });
  const send = (e) => {
    e.preventDefault();
    // Hozircha xabar shu brauzerda saqlanadi. Keyin Supabase yoki email xizmatiga ulanadi.
    try {
      const old = JSON.parse(localStorage.getItem("english-arena-msgs") || "[]");
      localStorage.setItem("english-arena-msgs", JSON.stringify([...old, { ...msg, at: Date.now() }]));
    } catch (err) {}
    setSent(true); setMsg({ name: "", text: "" });
  };
  return (
    <>
      <section className="lhero">
        <h1>O'yna.<br />O'rgan.<br />G'olib bo'l!</h1>
        <p>Ingliz tilini o'yin orqali o'rgan: 3-sinfdan 18–20 yoshgacha, telefonda ham, kompyuterda ham.</p>
        <div className="row left">
          <button className="btn big" onClick={() => go(p.registered ? "/games" : "/start")}>{p.registered ? "O'yinlarga o'tish" : "Boshlash"}</button>
          <a className="ghost" href="#/rating">Reytingni ko'r</a>
        </div>
        <div className="tiles">
          {ALL.map((g, i) => (
            <a key={g.id} href="#/games" className="tile" style={{ background: g.color, transform: `rotate(${i % 2 ? 3 : -3}deg)` }}>
              <span>{g.emoji}</span><b>{g.name}</b>
            </a>
          ))}
        </div>
      </section>

      <h2 className="sec">Nimalar bor?</h2>
      <div className="feats">
        {[["🎮", `${ALL.length} ta o'yin`, "Bosish, sudrash, yozish, eshitish: har o'yin boshqacha."],
          ["📅", "Kunlik vazifalar", "Har kuni yangi vazifa va qo'shimcha XP."],
          ["🏆", "Sinf reytingi", "Sinfdoshlaring bilan XP bo'yicha musobaqa."],
          ["👤", "Shaxsiy profil", "Daraja, ketma-ket kunlar va avatar."]].map(([e, t, d]) => (
          <div key={t} className="feat"><span>{e}</span><b>{t}</b><p>{d}</p></div>))}
      </div>

      <h2 className="sec">Guruhlar</h2>
      <div className="feats">
        {GROUPS.map((g) => (
          <div key={g.id} className="feat group"><span>{g.emoji}</span><b>{g.name}</b><small>{g.age}</small><p>{g.text}</p></div>))}
      </div>

      <h2 className="sec">Qanday ishlaydi?</h2>
      <ol className="steps">
        <li><b>Ro'yxatdan o't</b> ismingni va guruhingni tanla.</li>
        <li><b>O'yna</b> o'yin tanla, ball to'pla.</li>
        <li><b>Yuksal</b> XP yig'ib reytingda yuqoriga chiq.</li>
      </ol>

      <h2 className="sec">Ko'p so'raladigan savollar</h2>
      <div className="faq">{FAQ.map(([q, a], i) => (
        <div key={q} className="qa">
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{q}<span>{open === i ? "−" : "+"}</span></button>
          {open === i && <p>{a}</p>}
        </div>))}
      </div>

      <h2 className="sec">Bog'lanish</h2>
      <form className="panel cform" onSubmit={send}>
        {sent ? <p className="thanks">Rahmat! Xabaringiz qabul qilindi. ✅</p> : <>
          <input required placeholder="Ismingiz" value={msg.name} onChange={(e) => setMsg({ ...msg, name: e.target.value })} />
          <textarea required rows={4} placeholder="Savol yoki taklifingiz" value={msg.text} onChange={(e) => setMsg({ ...msg, text: e.target.value })} />
          <button className="btn" type="submit">Yuborish</button></>}
      </form>
    </>
  );
}

function Start({ p, setP, user, onGoogle, authErr, emailBox }) {
  const [f, setF] = useState({ name: p.registered ? p.name : "", group: p.group || "kichik", avatar: p.avatar });
  // Google'dan keyin ism avtomatik kelsa, bo'sh maydonni to'ldirib qo'yamiz
  useEffect(() => { if (!f.name && p.name && p.name !== "Yangi o'quvchi") setF((x) => ({ ...x, name: p.name })); }, [p.name]);
  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    setP({ ...p, name: f.name.trim(), group: f.group, avatar: f.avatar, registered: true });
    go("/games");
  };
  return (
    <form className="panel" onSubmit={submit}>
      <h2 className="sec">{p.registered ? "Ma'lumotlarni o'zgartirish" : "Xush kelibsan! 👋"}</h2>
      {!p.registered && <p className="lbl">O'ynashdan oldin o'zing haqingda ma'lumotlarni to'ldir.</p>}
      {cloudOn && !user && !p.registered && (
        <div className="panel" style={{ textAlign: "center", marginBottom: 22 }}>
          <button type="button" className="btn big" onClick={onGoogle}>🔵 Google bilan kirish</button>
          <p className="lbl">Natijalaring saqlanadi va istalgan qurilmada ochiladi. Google'siz davom etsang, natijalar faqat shu qurilmada qoladi.</p>
          {authErr && <p className="lbl" role="alert">{authErr}</p>}
          <p className="lbl">Google ishlamasa:</p>
          {emailBox}
        </div>
      )}
      {user && <p className="lbl">✅ Hisob ulangan: {user.email}</p>}
      <label className="lbl" htmlFor="nm">Isming</label>
      <input id="nm" className="typebox left" maxLength={18} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Masalan: Aziza" />
      <p className="lbl">Guruhing</p>
      <div className="feats">{GROUPS.map((g) => (
        <button type="button" key={g.id} className={"feat group pick" + (f.group === g.id ? " on" : "")} onClick={() => setF({ ...f, group: g.id })}>
          <span>{g.emoji}</span><b>{g.name}</b><small>{g.age}</small></button>))}</div>
      <p className="lbl">Avatar</p>
      <div className="avs">{AVATARS.map((a) => <button type="button" key={a} className={a === f.avatar ? "on" : ""} onClick={() => setF({ ...f, avatar: a })}>{a}</button>)}</div>
      <p><button className="btn big" type="submit" disabled={!f.name.trim()}>Tayyor! O'ynashni boshlash 🚀</button></p>
    </form>
  );
}

function Account({ user, onLogout, onGoogle, authErr, emailBox }) {
  if (!cloudOn) return null;
  return (
    <div className="panel">
      {user ? <>
        <p className="lbl">✅ Hisob: {user.email}. Natijalaring saqlanmoqda.</p>
        <button className="ghost" onClick={onLogout}>Hisobdan chiqish</button>
      </> : <>
        <p className="lbl">Natijalaring faqat shu qurilmada. Saqlab qo'yish uchun hisobni ulang.</p>
        <button className="btn" onClick={onGoogle}>🔵 Google bilan ulash</button>
        {authErr && <p className="lbl" role="alert">{authErr}</p>}
        <p className="lbl">Google ishlamasa:</p>
        {emailBox}
      </>}
    </div>
  );
}

function Games({ onPlay }) {
  const [q, setQ] = useState("");
  const list = ALL.filter((g) => (g.name + g.desc).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <h2 className="sec">O'yinlar ({ALL.length})</h2>
      <input className="typebox left" placeholder="O'yin qidirish..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="O'yin qidirish" />
      <div className="games" style={{ marginTop: 14 }}>
        {list.map((g) => (
          <button key={g.id} className="gcard" style={{ "--c": g.color }} onClick={() => onPlay(g)}>
            <span className="gemo">{g.emoji}</span><b>{g.name}</b><small>{g.desc}</small></button>))}
        {!list.length && <p>Bunday o'yin topilmadi. Boshqa so'z bilan qidirib ko'r.</p>}
      </div>
    </>
  );
}

function Daily({ p, onClaim }) {
  const d = p.daily;
  const tasks = [
    { id: "g2", t: "2 ta o'yin o'yna", now: Math.min(d.games, 2), max: 2, r: 20 },
    { id: "x60", t: "Bugun 60 XP yig'", now: Math.min(d.xp, 60), max: 60, r: 20 },
    { id: "perf", t: "1 ta xatosiz o'yin qil", now: Math.min(d.perfect, 1), max: 1, r: 30 },
  ];
  return (
    <>
      <h2 className="sec">Kunlik vazifalar</h2>
      <div className="tasks">{tasks.map((k) => {
        const ok = k.now >= k.max;
        return (
          <div key={k.id} className={"task" + (ok ? " ready" : "")}>
            <div><b>{k.t}</b><div className="bar"><i style={{ width: (k.now / k.max) * 100 + "%" }} /></div></div>
            {d.claimed.includes(k.id) ? <span className="done">✓ Olindi</span>
              : <button className="btn sm" disabled={!ok} onClick={() => onClaim(k.id, k.r)}>+{k.r} XP</button>}
          </div>);
      })}</div>
      <p className="lbl">Vazifalar har kuni yangilanadi. 🔥 Ketma-ket kun: {p.streak}</p>
    </>
  );
}

export default function Site() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("ea-language") || "uz"; } catch { return "uz"; } });
  useEffect(() => {
    const root = document.querySelector(".app.site");
    if (!root) return;
    applyLanguage(root, lang);
    const observer = new MutationObserver(() => applyLanguage(root, lang));
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [lang]);
  const changeLanguage = (next) => {
    try { localStorage.setItem("ea-language", next); } catch {}
    window.location.reload();
  };

  const [p, setP] = useState(loadProfile);
  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [boot, setBoot] = useState(cloudOn); // Google sessiyasi tekshirilmoqda
  const [board, setBoard] = useState(null);
  const [authErr, setAuthErr] = useState(null);
  const loaded = useRef(false);   // bazadan yuklab bo'lingandan keyingina saqlaymiz
  const redirected = useRef(false);
  const userId = useRef(null);    // qaysi foydalanuvchi profili yuklangan
  const signingIn = useRef(false); // "Google bilan kirish" bosilganmi
  const pending = useRef(null);   // hali bazaga yozilmagan o'zgarish
  const route = useHash();

  // Google sessiyasi va bazadagi profilni yuklash
  useEffect(() => {
    let alive = true;
    const apply = async (session) => {
      const u = session?.user || null;
      setUser(u);
      if (!u) { loaded.current = false; userId.current = null; setBoot(false); return; }
      userId.current = u.id;
      const row = await fetchProfile(u.id);
      if (!alive) return;
      if (row) setP(normalizeProfile(row));
      else setP((q) => q.registered ? q : { ...q, name: (u.user_metadata?.full_name || "").split(" ")[0].slice(0, 18) || q.name });
      loaded.current = true;
      setBoot(false);
      // Google orqali kirgan va profili bor o'quvchi darhol o'yinlarga o'tadi
      if (signingIn.current && row) go("/games");
      signingIn.current = false;
    };
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN" && event !== "SIGNED_OUT") { setUser(session?.user || null); return; }
      if (event === "SIGNED_IN" && session?.user?.id && session.user.id === userId.current) return; // allaqachon yuklangan
      setTimeout(() => apply(session), 0);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  // Kutilayotgan o'zgarishni darhol bazaga yozish
  const flush = () => {
    const job = pending.current;
    pending.current = null;
    if (job) saveProfile(job.id, job.p);
  };

  // Saqlash: har doim shu qurilmaga, Google bilan kirgan bo'lsa bazaga ham
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
    if (!user || !loaded.current || !p.registered) return;
    pending.current = { id: user.id, p };
    const t = setTimeout(flush, 500);
    return () => clearTimeout(t);
  }, [p, user]);

  // Sahifa yopilsa yoki fon rejimiga o'tsa, natijani yo'qotmaymiz
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => { window.removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", onHide); };
  }, []);

  // Ro'yxatdan o'tgan o'quvchi sayt ochganda to'g'ri o'yinlarga tushadi
  useEffect(() => {
    if (boot || redirected.current) return;
    redirected.current = true;
    if (p.registered && route === "/") go("/games");
  }, [boot, p.registered]);

  // Reyting sahifasi ochilganda haqiqiy ro'yxatni olamiz (o'z guruhidagi top 50)
  useEffect(() => {
    if (route !== "/rating" || !user || !p.registered) return;
    let alive = true;
    flush();
    setBoard(null);
    fetchBoard(p.group || "kichik").then((rows) => { if (alive) setBoard(rows || []); });
    return () => { alive = false; };
  }, [route, user, p.registered, p.group]);

  useEffect(() => { setGame(null); }, [route]);

  const onGoogle = async () => {
    setAuthErr(null);
    signingIn.current = true;
    const err = await signInGoogle();
    if (err) { signingIn.current = false; setAuthErr(err); }
  };

  const emailBox = <EmailAuth onStart={() => { setAuthErr(null); signingIn.current = true; }} onFail={() => { signingIn.current = false; }} />;

  const logout = async () => {
    flush();
    await signOut();
    try { localStorage.removeItem(KEY); } catch (e) {}
    loaded.current = false; setBoard(null); setP(loadProfile()); go("/");
  };

  const onResult = (score, perfect) => setP((q) => ({
    ...q, xp: q.xp + score, games: q.games + 1,
    daily: { ...q.daily, games: q.daily.games + 1, xp: q.daily.xp + score, perfect: q.daily.perfect + (perfect ? 1 : 0) },
  }));
  const onClaim = (id, r) => setP((q) => ({ ...q, xp: q.xp + r, daily: { ...q.daily, claimed: [...q.daily.claimed, id] } }));

  const links = [["/", "Bosh sahifa"], ["/games", "O'yinlar"], ["/daily", "Vazifalar"], ["/rating", "Reyting"], ["/explain", "Yordamchi"], ["/profile", "Profil"]];
  const ratingNote = cloudOn && !user ? "Bu namunaviy ro'yxat. Haqiqiy sinf reytingi uchun Google bilan kiring." : null;
  let page;
  if (boot) page = <p className="lbl">Yuklanmoqda...</p>;
  else if (!p.registered) page = <Start p={p} setP={setP} user={user} onGoogle={onGoogle} authErr={authErr} emailBox={emailBox} />;   // birinchi bo'lib shu oyna
  else if (game) page = <GameShell game={game} onExit={() => setGame(null)} onResult={onResult} />;
  else if (route === "/games") page = <Games onPlay={setGame} />;
  else if (route === "/daily") page = <Daily p={p} onClaim={onClaim} />;
  else if (route === "/rating") page = user && board === null
    ? <p className="lbl">Yuklanmoqda...</p>
    : <Rating p={p} rows={user ? board : null} myId={user?.id} note={ratingNote} />;
  else if (route === "/explain") page = <Explain signedIn={!!user} onGoogle={onGoogle} />;
  else if (route === "/profile") page = <><Profile p={p} setP={setP} /><p><a className="ghost" href="#/start">Guruh va ismni o'zgartirish</a></p><Account user={user} onLogout={logout} onGoogle={onGoogle} authErr={authErr} emailBox={emailBox} /></>;
  else if (route === "/start") page = <Start p={p} setP={setP} user={user} onGoogle={onGoogle} authErr={authErr} emailBox={emailBox} />;
  else page = <Landing p={p} />;

  return (
    <div className="app site">
      <style>{THEME_CSS}{NEW_CSS}{`.top-actions{display:flex;align-items:center;gap:10px}.lang-toggle{border:1px solid var(--line,#ddd);background:#fff;color:var(--ink,#222);border-radius:999px;padding:9px 13px;font-weight:800;cursor:pointer}`}</style>
      <header className="top">
        <a className="logo" href={p.registered ? "#/" : "#/start"}>🏟️ English Arena</a>
        <div className="top-actions"><button type="button" className="lang-toggle" onClick={() => changeLanguage(lang === "uz" ? "en" : "uz")}>{lang === "uz" ? "🇬🇧 EN" : "🇺🇿 UZ"}</button><span className="pill">{p.avatar} {p.registered ? p.name : "Mehmon"} · {p.xp} XP</span></div>
      </header>
      {p.registered && (
        <nav className="tnav" aria-label="Asosiy menyu">
          {links.map(([to, l]) => <a key={to} href={"#" + to} className={route === to && !game ? "on" : ""}>{l}</a>)}
        </nav>
      )}
      <main>{page}</main>
      <footer className="foot">© English Arena · O'yna va o'rgan</footer>
    </div>
  );
}
