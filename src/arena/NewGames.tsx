// @ts-nocheck
// English Arena: 10 ta yangi o'yin. Har birida 3 ta daraja (Oson / O'rta / Qiyin).
// Daraja ochilishi: oldingi darajada eng ko'p ballning 60% ini to'plash kerak.
import { useState, useEffect, useMemo } from "react";
import { WORDS, shuffle, fresh, oneOf } from "./Data";

/* ================= DARAJALAR ================= */
const LKEY = "english-arena-levels-v1";
const PASS = 0.6;
const LEVELS = [
  { n: 1, name: "Oson", mult: 1, stars: "⭐" },
  { n: 2, name: "O'rta", mult: 1.5, stars: "⭐⭐" },
  { n: 3, name: "Qiyin", mult: 2, stars: "⭐⭐⭐" },
];
const readLv = () => { try { return JSON.parse(localStorage.getItem(LKEY)) || {}; } catch (e) { return {}; } };
const saveLv = (id, n) => { try { const a = readLv(); a[id] = n; localStorage.setItem(LKEY, JSON.stringify(a)); } catch (e) {} };

// O'yinni daraja tanlash oynasi bilan o'raydi. max = 1-darajadagi eng ko'p ball.
function withLevels(id, Game, max) {
  return function Leveled({ finish }) {
    const [lv, setLv] = useState(0);
    const open = readLv()[id] || 1;
    if (!lv) {
      return (
        <div className="center">
          <p className="prompt">Darajani tanla</p>
          <div className="lvls">
            {LEVELS.map((L) => {
              const locked = L.n > open;
              return (
                <button key={L.n} className={"lvl" + (locked ? " lock" : "")} disabled={locked} onClick={() => setLv(L.n)}>
                  <b>{L.stars} {L.n}-daraja: {L.name}</b>
                  <span>XP ×{L.mult}</span>
                  {locked && <small>🔒 Oldingi darajada {Math.ceil(max * PASS)} ball to'pla</small>}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    const done = (score, perfect) => {
      const L = LEVELS[lv - 1];
      let note = "";
      if (lv === open && lv < 3) {
        if (score / max >= PASS) { saveLv(id, lv + 1); note = `🔓 ${lv + 1}-daraja ochildi!`; }
        else note = `${lv + 1}-darajani ochish uchun kamida ${Math.ceil(max * PASS)} ball kerak.`;
      }
      finish(Math.round(score * L.mult), perfect, note);
    };
    return <Game level={lv} finish={done} />;
  };
}

/* ================= UMUMIY QISMLAR ================= */
const speak = (t) => {
  try { const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; u.rate = 0.85; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch (e) {}
};

// Variantli savollar: rounds = [{ prompt, opts: [{label, ok}], explain? }]
function Quiz({ rounds, pts, finish }) {
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [pick, setPick] = useState(null);
  const r = rounds[i];
  const choose = (k) => {
    if (pick !== null) return;
    setPick(k);
    const n = ok + (r.opts[k].ok ? 1 : 0);
    setTimeout(() => {
      if (i === rounds.length - 1) finish(n * pts, n === rounds.length);
      else { setOk(n); setI(i + 1); setPick(null); }
    }, r.explain ? 1800 : 800);
  };
  return (
    <div className="center">
      <div className="hud"><span>✅ {ok}</span><span>{i + 1}/{rounds.length}</span></div>
      {r.prompt}
      <div className="opts">
        {r.opts.map((o, k) => (
          <button key={k} className={"chip opt" + (pick !== null ? (o.ok ? " good" : pick === k ? " bad" : "") : "")} onClick={() => choose(k)}>{o.label}</button>
        ))}
      </div>
      {pick !== null && r.explain && <p className="explain">{r.explain}</p>}
    </div>
  );
}

// Yozib javob beriladigan savollar: rounds = [{ prompt, fields: [{ph, ans}], digits?, say? }]
function TypeGame({ rounds, finish, pts = 10 }) {
  const [i, setI] = useState(0);
  const [vals, setVals] = useState(rounds[0].fields.map(() => ""));
  const [res, setRes] = useState(null);
  const [sc, setSc] = useState(0);
  const [allOk, setAllOk] = useState(true);
  const r = rounds[i];
  const norm = (s) => (r.digits ? s.replace(/\D/g, "") : s.trim().toLowerCase());
  const submit = (e) => {
    e.preventDefault();
    if (res) {
      if (i === rounds.length - 1) finish(Math.round(sc), allOk);
      else { setI(i + 1); setVals(rounds[i + 1].fields.map(() => "")); setRes(null); }
      return;
    }
    const rr = r.fields.map((f, k) => norm(vals[k] || "") === f.ans);
    setSc((s) => s + (pts * rr.filter(Boolean).length) / rr.length);
    if (rr.includes(false)) setAllOk(false);
    setRes(rr);
  };
  const key = (e, k) => {
    if (e.key === "Enter" && !res && k < r.fields.length - 1) { e.preventDefault(); document.getElementById("tf" + (k + 1))?.focus(); }
  };
  return (
    <form className="center" onSubmit={submit}>
      <div className="hud"><span>⭐ {Math.round(sc)}</span><span>{i + 1}/{rounds.length}</span></div>
      {r.prompt}
      {r.say && <p><button type="button" className="btn sm" onClick={() => speak(r.say)}>🔊 Eshit</button></p>}
      {r.fields.map((f, k) => (
        <div key={i + "-" + k}>
          <input id={"tf" + k} className="typebox" autoFocus={k === 0} autoComplete="off" autoCapitalize="off" spellCheck={false}
            inputMode={r.digits ? "numeric" : "text"} placeholder={f.ph} value={vals[k] || ""} disabled={!!res}
            onChange={(e) => setVals(vals.map((v, j) => (j === k ? e.target.value : v)))} onKeyDown={(e) => key(e, k)} />
          {res && <p className={"verdict " + (res[k] ? "ok" : "no")}>{res[k] ? "✅ To'g'ri!" : <>❌ To'g'ri javob: <b>{r.digits ? Number(f.ans).toLocaleString("en-US") : f.ans}</b></>}</p>}
        </div>
      ))}
      <button className="btn big" type="submit">{res ? (i === rounds.length - 1 ? "Yakunlash 🏁" : "Keyingisi →") : "Tekshirish"}</button>
    </form>
  );
}

/* ================= 1. XATONI TOP ================= */
// [gap, xato so'z, to'g'risi, izoh]
const ERR = {
  1: [
    ["She go to school every day", "go", "goes", "He/she/it bilan fe'lga -s/-es qo'shiladi."],
    ["I has a red ball", "has", "have", "\"I\" bilan have ishlatiladi."],
    ["They is my friends", "is", "are", "\"They\" bilan are ishlatiladi."],
    ["He like pizza", "like", "likes", "\"He\" bilan fe'lga -s qo'shiladi."],
    ["We plays football on Sunday", "plays", "play", "\"We\" bilan fe'lga -s qo'shilmaydi."],
    ["I have a apple", "a", "an", "Unli tovush oldidan an ishlatiladi."],
    ["There are two cat in the room", "cat", "cats", "Ikkitadan ko'p/ikkita bo'lsa ko'plik: cats."],
    ["My sister are ten years old", "are", "is", "Sister bitta, shuning uchun is."],
    ["Tom don't like milk", "don't", "doesn't", "He/she/it/Tom bilan doesn't ishlatiladi."],
    ["This is an book", "an", "a", "Book undosh bilan boshlanadi, shuning uchun a."],
    ["She can swims very well", "swims", "swim", "can dan keyin fe'l o'zgarmaydi."],
    ["Anna and Tom is happy", "is", "are", "Ikki kishi bo'lgani uchun are."],
  ],
  2: [
    ["Yesterday I go to the park", "go", "went", "Yesterday o'tgan zamonni bildiradi: went."],
    ["There is many books on the table", "is", "are", "Many + ko'plik, shuning uchun there are."],
    ["She didn't went to school", "went", "go", "didn't dan keyin fe'lning asosiy shakli: go."],
    ["I have much friends", "much", "many", "Sanaladigan otlar bilan many ishlatiladi."],
    ["He is taller then me", "then", "than", "Taqqoslashda than ishlatiladi."],
    ["We are interested on music", "on", "in", "interested in: qiziqmoq."],
    ["She is good in English", "in", "at", "good at: biror narsada yaxshi."],
    ["How much apples do you want", "much", "many", "Apples sanaladi: how many."],
    ["She doesn't likes tea", "likes", "like", "doesn't dan keyin fe'l o'zgarmaydi."],
    ["The children is playing in the garden", "is", "are", "Children ko'plik: are."],
    ["I don't have no money", "no", "any", "Inkor gapda any ishlatiladi."],
    ["They was at home last night", "was", "were", "\"They\" bilan were ishlatiladi."],
  ],
  3: [
    ["If it rains tomorrow, we will stayed at home", "stayed", "stay", "will dan keyin fe'lning asosiy shakli."],
    ["I have saw that film", "saw", "seen", "have + V3: seen."],
    ["I look forward to see you", "see", "seeing", "look forward to dan keyin -ing shakli keladi."],
    ["She lives here since 2010", "lives", "has lived", "since bilan Present Perfect ishlatiladi."],
    ["Neither of the boys are ready", "are", "is", "Neither of ... bilan odatda is ishlatiladi."],
    ["There is less students in class today", "less", "fewer", "Sanaladigan otlar bilan fewer."],
    ["The book who I read was great", "who", "which", "Narsalar uchun which (yoki that) ishlatiladi."],
    ["I wish I have a bigger house", "have", "had", "wish dan keyin o'tgan zamon shakli (had)."],
    ["By the time we arrived, the film already started", "started", "had started", "Oldingi harakat uchun Past Perfect: had started."],
    ["If I had known, I would told you", "told", "have told", "3-shartli gap: would have + V3."],
    ["He is more taller than his brother", "more", "(olib tashla)", "Taller o'zi qiyoslama daraja, more kerak emas."],
    ["Each of the students have a book", "have", "has", "Each of ... bilan yagona son: has."],
  ],
};

function Errors({ level, finish }) {
  const items = useMemo(() => fresh(ERR[level].map((x, id) => ({ s: x[0], bad: x[1], fix: x[2], why: x[3], id })), 8, "err" + level, (x) => x.id), []);
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [pick, setPick] = useState(null);
  const it = items[i];
  const ws = it.s.split(" ");
  const badIdx = ws.findIndex((w) => w === it.bad);
  const tap = (k) => { if (pick !== null) return; setPick(k); if (k === badIdx) setOk((o) => o + 1); };
  const next = () => { if (i === items.length - 1) finish(ok * 10, ok === items.length); else { setI(i + 1); setPick(null); } };
  return (
    <div className="center">
      <div className="hud"><span>✅ {ok}</span><span>{i + 1}/{items.length}</span></div>
      <p className="prompt">Gapdagi <b>xato so'zni</b> top va bos</p>
      <div className="words">
        {ws.map((w, k) => (
          <button key={k} className={"word" + (pick !== null ? (k === badIdx ? " fix" : k === pick ? " bad" : "") : "")} onClick={() => tap(k)}>{w}</button>
        ))}
      </div>
      {pick !== null && (
        <>
          <p className="explain">{pick === badIdx ? "✅ To'g'ri!" : "❌ Xato topding."} To'g'risi: <b>{it.fix}</b>. {it.why}</p>
          <button className="btn" onClick={next}>{i === items.length - 1 ? "Yakunlash 🏁" : "Keyingisi →"}</button>
        </>
      )}
    </div>
  );
}

/* ================= 2. SOAT USTASI ================= */
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const small = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : ""));
const hw = (h) => ONES[((h - 1) % 12) + 1];
export function say(h, m) {
  if (m === 0) return `${hw(h)} o'clock`;
  if (m === 15) return `quarter past ${hw(h)}`;
  if (m === 30) return `half past ${hw(h)}`;
  if (m === 45) return `quarter to ${hw(h + 1)}`;
  return m < 30 ? `${small(m)} past ${hw(h)}` : `${small(60 - m)} to ${hw(h + 1)}`;
}

function Clock({ h, m, size = 150 }) {
  const hand = (a, len, w) => {
    const r = (a * Math.PI) / 180;
    return <line x1="60" y1="60" x2={60 + len * Math.sin(r)} y2={60 - len * Math.cos(r)} stroke="#1B1B3A" strokeWidth={w} strokeLinecap="round" />;
  };
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="soat">
      <circle cx="60" cy="60" r="56" fill="#fff" stroke="#1B1B3A" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, k) => {
        const a = ((k + 1) * 30 * Math.PI) / 180;
        return <text key={k} x={60 + 44 * Math.sin(a)} y={60 - 44 * Math.cos(a) + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1B1B3A">{k + 1}</text>;
      })}
      {hand((h % 12) * 30 + m * 0.5, 28, 5)}
      {hand(m * 6, 42, 3)}
      <circle cx="60" cy="60" r="4" fill="#FF4B4B" />
    </svg>
  );
}

function clockRounds(level) {
  const m5 = [0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55];
  const used = new Set();
  const out = [];
  while (out.length < 8) {
    const h = 1 + Math.floor(Math.random() * 12);
    const m = level === 1 ? oneOf([0, 30]) : level === 2 ? oneOf(m5) : Math.random() < 0.5 ? oneOf(m5) : 1 + Math.floor(Math.random() * 59);
    const key = h + ":" + m;
    if (used.has(key)) continue;
    used.add(key);
    const mode = level === 3 && out.length % 2 === 1 ? "pick" : "read";
    const cands = shuffle([[h, (60 - m) % 60], [(h % 12) + 1, m], [((h + 10) % 12) + 1, m], [h, (m + 30) % 60], [h, (m + 15) % 60], [h, (m + 45) % 60], [(h % 12) + 1, (60 - m) % 60]]);
    const seen = new Set([say(h, m)]);
    const others = [];
    for (const c of cands) { const s = say(c[0], c[1]); if (!seen.has(s)) { seen.add(s); others.push(c); } if (others.length === 3) break; }
    const all = shuffle([[h, m, true], ...others.map((c) => [c[0], c[1], false])]);
    out.push(mode === "read"
      ? { prompt: <><Clock h={h} m={m} /><p className="prompt">Soat nechchi?</p></>, opts: all.map(([a, b, ok]) => ({ label: say(a, b), ok })) }
      : { prompt: <p className="prompt">Qaysi soat <b>{say(h, m)}</b> ni ko'rsatadi?</p>, opts: all.map(([a, b, ok]) => ({ label: <Clock h={a} m={b} size={104} />, ok })) });
  }
  return out;
}
function ClockGame({ level, finish }) {
  const rounds = useMemo(() => clockRounds(level), []);
  return <Quiz rounds={rounds} pts={10} finish={finish} />;
}

/* ================= 3. RAQAM USTASI ================= */
export function words(n) {
  if (n < 100) return small(n);
  if (n < 1000) { const h = Math.floor(n / 100), r = n % 100; return `${ONES[h]} hundred` + (r ? ` and ${small(r)}` : ""); }
  const t = Math.floor(n / 1000), r = n % 1000;
  return `${words(t)} thousand` + (r ? (r < 100 ? ` and ${small(r)}` : ` ${words(r)}`) : "");
}
function Numbers({ level, finish }) {
  const rounds = useMemo(() => {
    const set = new Set();
    while (set.size < 8) {
      const n = level === 1 ? 11 + Math.floor(Math.random() * 89)
        : level === 2 ? 101 + Math.floor(Math.random() * 899)
        : 1001 + Math.floor(Math.random() * 98999);
      set.add(n);
    }
    return [...set].map((n) => ({
      prompt: <><p className="prompt">Raqam bilan yoz:</p><div className="bignum">{words(n)}</div></>,
      fields: [{ ph: "raqamni yoz", ans: String(n) }], digits: true, say: words(n),
    }));
  }, []);
  return <TypeGame rounds={rounds} finish={finish} />;
}

/* ================= 4. FE'L FORMALARI ================= */
const REG = [["play", "played", "o'ynamoq"], ["walk", "walked", "yurmoq"], ["open", "opened", "ochmoq"], ["clean", "cleaned", "tozalamoq"], ["help", "helped", "yordam bermoq"], ["watch", "watched", "tomosha qilmoq"], ["jump", "jumped", "sakramoq"], ["cook", "cooked", "pishirmoq"], ["love", "loved", "yaxshi ko'rmoq"], ["dance", "danced", "raqsga tushmoq"], ["live", "lived", "yashamoq"], ["study", "studied", "o'qimoq"], ["carry", "carried", "ko'tarmoq"], ["try", "tried", "urinmoq"], ["cry", "cried", "yig'lamoq"], ["stop", "stopped", "to'xtamoq"], ["plan", "planned", "rejalashtirmoq"], ["drop", "dropped", "tushirib yubormoq"]];
const IRR = [["go", "went", "gone", "bormoq"], ["see", "saw", "seen", "ko'rmoq"], ["eat", "ate", "eaten", "yemoq"], ["drink", "drank", "drunk", "ichmoq"], ["write", "wrote", "written", "yozmoq"], ["take", "took", "taken", "olmoq"], ["give", "gave", "given", "bermoq"], ["make", "made", "made", "yasamoq"], ["buy", "bought", "bought", "sotib olmoq"], ["bring", "brought", "brought", "olib kelmoq"], ["think", "thought", "thought", "o'ylamoq"], ["know", "knew", "known", "bilmoq"], ["run", "ran", "run", "yugurmoq"], ["come", "came", "come", "kelmoq"], ["begin", "began", "begun", "boshlamoq"], ["swim", "swam", "swum", "suzmoq"], ["sing", "sang", "sung", "kuylamoq"], ["fly", "flew", "flown", "uchmoq"], ["draw", "drew", "drawn", "chizmoq"], ["drive", "drove", "driven", "haydamoq"], ["speak", "spoke", "spoken", "gapirmoq"], ["break", "broke", "broken", "sindirmoq"], ["choose", "chose", "chosen", "tanlamoq"], ["forget", "forgot", "forgotten", "unutmoq"], ["find", "found", "found", "topmoq"], ["tell", "told", "told", "aytmoq"], ["sell", "sold", "sold", "sotmoq"], ["sit", "sat", "sat", "o'tirmoq"], ["stand", "stood", "stood", "turmoq"], ["sleep", "slept", "slept", "uxlamoq"], ["teach", "taught", "taught", "o'rgatmoq"], ["catch", "caught", "caught", "ushlamoq"], ["build", "built", "built", "qurmoq"], ["win", "won", "won", "yutmoq"], ["lose", "lost", "lost", "yo'qotmoq"], ["hear", "heard", "heard", "eshitmoq"], ["meet", "met", "met", "uchrashmoq"], ["leave", "left", "left", "ketmoq"], ["wear", "wore", "worn", "kiymoq"], ["ride", "rode", "ridden", "minmoq"], ["fall", "fell", "fallen", "yiqilmoq"], ["grow", "grew", "grown", "o'smoq"], ["throw", "threw", "thrown", "otmoq"]];
function Verbs({ level, finish }) {
  const rounds = useMemo(() => {
    if (level === 1) {
      return fresh(REG.map((x, id) => ({ x, id })), 8, "verbs1", (o) => o.id).map(({ x }) => ({
        prompt: <p className="prompt"><b>{x[0]}</b> ({x[2]})<br /><small>O'tgan zamon shaklini yoz (V2)</small></p>,
        fields: [{ ph: "V2", ans: x[1] }],
      }));
    }
    return fresh(IRR.map((x, id) => ({ x, id })), 8, "verbs" + level, (o) => o.id).map(({ x }) => ({
      prompt: <p className="prompt"><b>{x[0]}</b> ({x[3]})<br /><small>{level === 2 ? "O'tgan zamon shaklini yoz (V2)" : "Ikkala shaklni yoz: V2 va V3"}</small></p>,
      fields: level === 2 ? [{ ph: "V2", ans: x[1] }] : [{ ph: "V2 (o'tgan zamon)", ans: x[1] }, { ph: "V3 (participle)", ans: x[2] }],
    }));
  }, []);
  return <TypeGame rounds={rounds} finish={finish} />;
}

/* ================= 5. SO'Z TURKUMI (tushayotgan so'z) ================= */
const POS = {
  n: { uz: "Ot", en: "Noun" },
  v: { uz: "Fe'l", en: "Verb" },
  a: { uz: "Sifat", en: "Adjective" },
  r: { uz: "Ravish", en: "Adverb" },
};
const SORTW = {
  1: { n: ["table", "teacher", "window", "river", "doctor", "garden", "kitchen", "mountain"], v: ["swim", "jump", "write", "listen", "climb", "carry", "forget", "enjoy"], a: ["happy", "tall", "clever", "hungry", "brave", "noisy", "small", "heavy"] },
  2: { n: ["happiness", "decision", "friendship", "kindness", "beauty", "teacher", "dancer", "freedom"], v: ["decide", "discover", "improve", "arrive", "enjoy", "organize", "forget", "believe"], a: ["dangerous", "famous", "delicious", "careful", "enormous", "beautiful", "friendly", "hopeful"] },
  3: { n: ["happiness", "decision", "freedom", "teacher", "kindness", "journey"], v: ["discover", "improve", "organize", "believe", "arrive", "decide"], a: ["dangerous", "famous", "delicious", "enormous", "beautiful", "friendly"], r: ["carefully", "quickly", "always", "rarely", "suddenly", "loudly", "never", "slowly"] },
};
function Sort({ level, finish }) {
  const kinds = Object.keys(SORTW[level]);
  const dur = [7, 5.5, 4.5][level - 1];
  const list = useMemo(() => {
    const pool = kinds.flatMap((p) => SORTW[level][p].map((w) => ({ w, p })));
    return fresh(pool, 10, "sort" + level, (x) => x.w);
  }, []);
  const N = list.length;
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [miss, setMiss] = useState(0);
  const [st, setSt] = useState("play");
  const cur = list[i];
  const settle = (p) => {
    if (st !== "play") return;
    const good = p === cur.p;
    const n = ok + (good ? 1 : 0);
    setSt(good ? "good" : "bad");
    if (good) setOk(n); else setMiss((m) => m + 1);
    setTimeout(() => {
      if (i === N - 1) finish(n * 8, n === N); else { setI(i + 1); setSt("play"); }
    }, 650);
  };
  return (
    <div className="center">
      <div className="hud"><span>✅ {ok}</span><span>❌ {miss}</span><span>{i + 1}/{N}</span></div>
      <p className="prompt">So'z tushmasdan oldin to'g'ri savatni bos</p>
      <div className="fallzone">
        <span key={i} className={"fallcard " + st} style={{ "--d": dur + "s", animationPlayState: st === "play" ? "running" : "paused" }}
          onAnimationEnd={() => settle(null)}>{cur.w}</span>
      </div>
      <div className="buckets" style={{ gridTemplateColumns: `repeat(${kinds.length},1fr)` }}>
        {kinds.map((p) => (
          <button key={p} className="bucket" onClick={() => settle(p)}><b>{POS[p].uz}</b><small>{POS[p].en}</small></button>
        ))}
      </div>
    </div>
  );
}

/* ================= 6. RANG SINOVI (Stroop) ================= */
const INK = { red: "#E53935", blue: "#1E88E5", green: "#2E9E4F", yellow: "#F2B600", orange: "#FB8C00", purple: "#8E24AA", pink: "#EC407A", brown: "#6D4C41" };
function Stroop({ level, finish }) {
  const names = Object.keys(INK);
  const pool = level < 3 ? names.slice(0, 4) : names;
  const time = [4.5, 3.5, 3][level - 1];
  const N = 10;
  const rounds = useMemo(() => Array.from({ length: N }, () => {
    const word = oneOf(pool);
    let ink = oneOf(pool.filter((x) => x !== word));
    if (Math.random() < 0.15) ink = word;
    const task = level === 1 ? "word" : level === 2 ? "ink" : oneOf(["word", "ink"]);
    const target = task === "word" ? word : ink;
    const other = task === "word" ? ink : word;
    let opts = pool;
    if (level === 3) {
      const must = other !== target ? [target, other] : [target];
      opts = shuffle([...must, ...shuffle(pool.filter((x) => !must.includes(x))).slice(0, 4 - must.length)]);
    }
    return { word, ink, task, target, opts: shuffle(opts) };
  }), []);
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [st, setSt] = useState("play");
  const r = rounds[i];
  const settle = (c) => {
    if (st !== "play") return;
    const good = c === r.target;
    const n = ok + (good ? 1 : 0);
    setSt(good ? "good" : "bad");
    if (good) setOk(n);
    setTimeout(() => {
      if (i === N - 1) finish(n * 8, n === N); else { setI(i + 1); setSt("play"); }
    }, 500);
  };
  return (
    <div className="center">
      <div className="hud"><span>✅ {ok}</span><span>{i + 1}/{N}</span></div>
      <div key={i} className="tbar" style={{ "--d": time + "s", animationPlayState: st === "play" ? "running" : "paused" }} onAnimationEnd={() => settle(null)} />
      <p className="prompt">{r.task === "word" ? <>👀 So'z <b>nima deydi</b>?</> : <>🎨 So'z <b>qaysi rangda</b> yozilgan?</>}</p>
      <div className={"inkword " + st} style={{ color: INK[r.ink] }}>{r.word.toUpperCase()}</div>
      <div className="opts">
        {r.opts.map((c) => r.task === "word"
          ? <button key={c} className="dot" aria-label={c} style={{ background: INK[c] }} onClick={() => settle(c)} />
          : <button key={c} className="chip" onClick={() => settle(c)}>{c}</button>)}
      </div>
    </div>
  );
}

/* ================= 7. ORTIQCHASINI TOP ================= */
const CAT_UZ = { hayvonlar: "hayvon", taomlar: "taom", ranglar: "rang", tabiat: "tabiat", buyumlar: "buyum", kiyim: "kiyim", transport: "transport", joylar: "joy", tana: "tana a'zosi", odamlar: "odam" };
// qiyin daraja: [4 ta so'z, ortiqchasi, izoh]
const ODD3 = [
  [["big", "large", "huge", "small"], "small", "Boshqalari \"katta\" degani, small esa \"kichik\"."],
  [["happy", "glad", "cheerful", "sad"], "sad", "Boshqalari xursandlik, sad esa xafalik."],
  [["went", "saw", "ate", "eat"], "eat", "Boshqalari o'tgan zamon (V2), eat esa asosiy shakl."],
  [["in", "on", "at", "quickly"], "quickly", "Boshqalari predlog, quickly esa ravish."],
  [["he", "she", "they", "my"], "my", "Boshqalari ega olmoshi, my esa egalik sifati."],
  [["Monday", "Friday", "July", "Sunday"], "July", "Boshqalari hafta kunlari, July esa oy."],
  [["teacher", "doctor", "driver", "hospital"], "hospital", "Boshqalari kasblar, hospital esa joy."],
  [["quick", "slow", "loud", "quickly"], "quickly", "Boshqalari sifat, quickly esa ravish."],
  [["pen", "book", "notebook", "bread"], "bread", "Boshqalari maktab buyumlari, bread esa taom."],
  [["first", "second", "three", "third"], "three", "Boshqalari tartib sonlar, three esa sanoq son."],
  [["apple", "banana", "carrot", "orange"], "carrot", "Boshqalari mevalar, carrot esa sabzavot."],
  [["wolf", "fox", "owl", "bear"], "owl", "Boshqalari sutemizuvchilar, owl esa qush."],
];
function oddRounds(level) {
  if (level === 3) {
    return fresh(ODD3.map((x, id) => ({ w: x[0], odd: x[1], why: x[2], id })), 8, "odd3", (x) => x.id).map((x) => ({
      prompt: <p className="prompt">Qaysi biri <b>ortiqcha</b>?</p>,
      opts: shuffle(x.w.map((w) => ({ label: w, ok: w === x.odd }))), explain: x.why,
    }));
  }
  const cats = [...new Set(WORDS.map((w) => w.cat))];
  return Array.from({ length: 8 }, () => {
    const [ca, cb] = shuffle(cats).slice(0, 2);
    const a = shuffle(WORDS.filter((w) => w.cat === ca)).slice(0, 3);
    const b = shuffle(WORDS.filter((w) => w.cat === cb))[0];
    const opts = shuffle([...a.map((w) => ({ w, ok: false })), { w: b, ok: true }]).map((o) => ({
      label: level === 1 ? <><span className="emoopt">{o.w.e}</span><br />{o.w.en}</> : o.w.en, ok: o.ok,
    }));
    return { prompt: <p className="prompt">Qaysi biri <b>ortiqcha</b>?</p>, opts, explain: `${b.en}: ${CAT_UZ[cb]}, qolganlari esa ${CAT_UZ[ca]}.` };
  });
}
function Odd({ level, finish }) {
  const rounds = useMemo(() => oddRounds(level), []);
  return <Quiz rounds={rounds} pts={10} finish={finish} />;
}

/* ================= 8. VOQEA TARTIBI ================= */
const STORIES = {
  1: [
    { title: "Ertalabki odatlar", t: ["I wake up at seven", "I wash my face", "I eat breakfast", "I go to school"] },
    { title: "Mushuk va sut", t: ["The cat is hungry", "Mom gives her milk", "The cat drinks the milk", "The cat sleeps"] },
    { title: "Bog'da", t: ["We go to the park", "We play football", "We are tired", "We go home"] },
    { title: "Tort", t: ["Anna makes a cake", "She puts it in the oven", "The cake is ready", "Everybody eats the cake"] },
  ],
  2: [
    { title: "Yomg'irli kun", t: ["It was cloudy in the morning", "Then it started to rain", "Tom opened his umbrella", "He walked to school slowly", "At noon the sun came out"] },
    { title: "Yo'qolgan kalit", t: ["Sara lost her key", "She looked under the bed", "She asked her brother", "He found the key in the kitchen", "Sara said thank you"] },
    { title: "Sayohat", t: ["We packed our bags", "We took a taxi to the station", "The train left at nine", "We arrived in Samarkand in the evening", "We were very happy"] },
    { title: "Futbol", t: ["Ali kicked the ball", "The ball flew over the fence", "A neighbour found it", "He gave it back to Ali", "Ali played again"] },
  ],
  3: [
    { title: "Sirli xat", t: ["First, Dilnoza opened the box", "Inside, she saw a small letter", "Then she read it carefully", "After that, she started to smile", "Finally, she called her grandmother", "They talked for an hour"] },
    { title: "Maktab loyihasi", t: ["Our teacher gave us a project", "First, we chose a topic", "Then we searched for information", "After that, we made a poster", "On Friday, we presented it to the class", "Finally, the teacher gave us good marks"] },
    { title: "Yangi velosiped", t: ["Aziz wanted to buy a bike", "He saved money for three months", "Finally, he had enough money", "He went to the shop with his father", "The seller showed him many bikes", "Aziz chose a blue one"] },
    { title: "Chiroq o'chdi", t: ["Yesterday the power went out", "We lit some candles", "Then we played board games", "After an hour, the lights came back", "We turned off the candles", "Everyone went to bed happy"] },
  ],
};
function Story({ level, finish }) {
  const stories = useMemo(() => fresh(STORIES[level].map((s, id) => ({ ...s, id })), 3, "story" + level, (x) => x.id), []);
  const [si, setSi] = useState(0);
  const [got, setGot] = useState([]);
  const [err, setErr] = useState(0);
  const [total, setTotal] = useState(0);
  const [allOk, setAllOk] = useState(true);
  const [bad, setBad] = useState(-1);
  const st = stories[si];
  const bank = useMemo(() => shuffle(st.t.map((s, k) => ({ s, k }))), [si]);
  const tap = (b) => {
    if (got.includes(b.k) || got.length === st.t.length) return;
    if (b.k !== got.length) { setErr((e) => e + 1); setAllOk(false); setBad(b.k); setTimeout(() => setBad(-1), 400); return; }
    const ng = [...got, b.k];
    setGot(ng);
    if (ng.length === st.t.length) {
      const sc = total + Math.max(0, 26 - 5 * err);
      setTotal(sc);
      setTimeout(() => {
        if (si === stories.length - 1) finish(sc, allOk);
        else { setSi(si + 1); setGot([]); setErr(0); }
      }, 900);
    }
  };
  return (
    <div className="center">
      <div className="hud"><span>❌ {err}</span><span>Hikoya {si + 1}/{stories.length}</span></div>
      <p className="prompt">📖 <b>{st.title}</b><br /><small>Gaplarni to'g'ri tartibda bos</small></p>
      <ol className="story">{got.map((k, n) => <li key={n}>{st.t[k]}</li>)}</ol>
      <div className="bank">
        {bank.map((b) => (
          <button key={b.k} className={"chip" + (bad === b.k ? " shake" : "")} disabled={got.includes(b.k)} onClick={() => tap(b)}>{b.s}</button>
        ))}
      </div>
    </div>
  );
}

/* ================= 9. O'QI VA JAVOB BER ================= */
// { text, q: [[savol, to'g'ri javob, ...noto'g'rilari]] }
const READ = {
  1: [
    { text: "Tom is nine years old. He has a small dog called Max. Every morning Tom takes Max to the park. They play with a red ball.", q: [["How old is Tom?", "Nine", "Seven", "Ten", "Twelve"], ["What is the dog's name?", "Max", "Tom", "Rex", "Red"], ["What do they play with?", "A red ball", "A blue ball", "A stick", "A bone"]] },
    { text: "Aisha lives in Samarkand. She likes fruit. Her favourite fruit is the grape. Her grandmother has a big garden with apple trees and grape vines.", q: [["Where does Aisha live?", "In Samarkand", "In Tashkent", "In Bukhara", "In Khiva"], ["What is her favourite fruit?", "The grape", "The apple", "The pear", "The banana"], ["What grows in the garden?", "Apple trees and grape vines", "Only flowers", "Carrots", "Rice"]] },
    { text: "It is Sunday. The weather is sunny and warm. Ben and his sister go to the lake. They swim and eat sandwiches. At six o'clock they go home.", q: [["What is the weather like?", "Sunny and warm", "Rainy", "Cold", "Windy"], ["Where do they go?", "To the lake", "To school", "To the shop", "To the zoo"], ["When do they go home?", "At six", "At five", "At seven", "At noon"]] },
  ],
  2: [
    { text: "Last summer, Dilshod visited his uncle in Bukhara. He stayed there for two weeks. Every day they walked through the old streets and visited markets. Dilshod bought a small blue bowl for his mother, but he lost his hat on the last day.", q: [["How long did Dilshod stay in Bukhara?", "Two weeks", "One week", "A month", "Three days"], ["What did he buy for his mother?", "A blue bowl", "A hat", "A scarf", "A book"], ["What did he lose?", "His hat", "His bag", "His phone", "His money"]] },
    { text: "Many people think cats do not like water, and this is often true. However, some cats, like the Turkish Van, love to swim. Their fur is special: it keeps them warm and dry even after swimming. People call them \"swimming cats\".", q: [["Which cats love to swim?", "Turkish Van cats", "All cats", "Small cats only", "Black cats"], ["What is special about their fur?", "It keeps them warm and dry", "It is very long", "It changes colour", "It is blue"], ["People often think that cats ...", "do not like water", "love water", "cannot jump", "sleep in water"]] },
    { text: "Our school library has changed a lot. Before, it was small and dark, and there were only a few old books. Now it is bright and has more than two thousand books. Students can also use computers there after lessons.", q: [["What was the library like before?", "Small and dark", "Big and bright", "Closed", "Full of computers"], ["How many books are there now?", "More than two thousand", "Very few", "About two hundred", "Exactly twenty"], ["When can students use the computers?", "After lessons", "Before lessons", "Only on Sunday", "During exams"]] },
  ],
  3: [
    { text: "Nodira wanted to improve her English, so she decided to change her habits. She started watching one short film in English every evening, first with Uzbek subtitles and later with English ones. After three months she noticed that she understood most of the dialogue without reading anything. She still makes mistakes when she speaks, but she is no longer afraid of them.", q: [["Why did Nodira start watching films?", "She wanted to improve her English", "She was bored", "Her teacher forced her", "She had no friends"], ["What changed after three months?", "She understood most dialogue without reading", "She started to speak perfectly", "She forgot Uzbek", "She became a film critic"], ["How does she feel about her mistakes now?", "She is not afraid of them", "She is ashamed", "She hides them", "She is angry"]] },
    { text: "The first mobile phone call was made in 1973, but ordinary people could not buy such phones for a long time. Early phones weighed about one kilogram and the battery lasted only about thirty minutes. Today, a phone fits in a pocket and can be used all day.", q: [["What does the text say about early phones?", "They were heavy with weak batteries", "They were light", "They were cheap", "They were small"], ["Who could not buy phones for a long time?", "Ordinary people", "Scientists", "Teachers", "Nobody"], ["What is the main idea of the text?", "Phones have become much better and smaller", "Phones are dangerous", "Batteries are expensive", "Calls were always free"]] },
    { text: "Although Karim was tired after the long journey, he could not sleep. The hotel room was quiet, but his mind was full of thoughts about tomorrow's exam. At midnight he got up, made a cup of tea and read his notes again. Strangely, he felt calmer and finally fell asleep at one o'clock.", q: [["Why couldn't Karim sleep?", "He was thinking about the exam", "The room was noisy", "He was hungry", "He was cold"], ["What did he do at midnight?", "Made tea and read his notes", "Went for a walk", "Called his mother", "Watched TV"], ["At what time did he fall asleep?", "At one o'clock", "At midnight", "At two o'clock", "At eleven"]] },
  ],
};
function Read({ level, finish }) {
  const rounds = useMemo(() => {
    const ps = fresh(READ[level].map((p, id) => ({ ...p, id })), 2, "read" + level, (x) => x.id);
    return ps.flatMap((p) => p.q.map(([q, good, ...bad]) => ({
      prompt: <><div className="passage">{p.text}</div><p className="prompt">{q}</p></>,
      opts: shuffle([{ label: good, ok: true }, ...bad.map((b) => ({ label: b, ok: false }))]),
    })));
  }, []);
  return <Quiz rounds={rounds} pts={13} finish={finish} />;
}

/* ================= 10. QAYERDA? (predloglar) ================= */
const OBJ = [["cat", "🐱"], ["dog", "🐶"], ["ball", "⚽"], ["box", "📦"], ["chair", "🪑"], ["tree", "🌳"], ["house", "🏠"], ["car", "🚗"], ["bird", "🐦"], ["bed", "🛏️"], ["bag", "🎒"], ["book", "📚"], ["lamp", "💡"]].map(([n, e]) => ({ n, e }));
const RELS1 = ["in", "on", "under", "next to"];
const RELS2 = [...RELS1, "behind", "in front of", "between"];
const sentence = (A, rel, B, C) => (rel === "between" ? `The ${A.n} is between the ${B.n} and the ${C.n}.` : `The ${A.n} is ${rel} the ${B.n}.`);

function Scene({ rel, A, B, C }) {
  const S = (e, style, k) => <span key={k} style={{ lineHeight: 1, ...style }}>{e}</span>;
  let kids;
  switch (rel) {
    case "on": kids = [S(A.e, { left: "50%", bottom: 68, transform: "translateX(-50%)", fontSize: 52 }, 1), S(B.e, { left: "50%", bottom: 4, transform: "translateX(-50%)", fontSize: 64 }, 2)]; break;
    case "under": kids = [S(B.e, { left: "50%", bottom: 60, transform: "translateX(-50%)", fontSize: 64 }, 1), S(A.e, { left: "50%", bottom: 4, transform: "translateX(-50%)", fontSize: 52 }, 2)]; break;
    case "in": kids = [S(B.e, { left: "50%", top: 22, transform: "translateX(-50%)", fontSize: 104 }, 1), S(A.e, { left: "50%", top: 56, transform: "translateX(-50%)", fontSize: 34, zIndex: 2 }, 2)]; break;
    case "next to": kids = [S(A.e, { left: "20%", top: 46, fontSize: 56 }, 1), S(B.e, { left: "60%", top: 46, fontSize: 56 }, 2)]; break;
    case "behind": kids = [S(A.e, { left: "30%", top: 28, fontSize: 66, zIndex: 1 }, 1), S(B.e, { left: "44%", top: 32, fontSize: 80, zIndex: 2 }, 2)]; break;
    case "in front of": kids = [S(B.e, { left: "52%", top: 28, fontSize: 66, zIndex: 1 }, 1), S(A.e, { left: "38%", top: 32, fontSize: 80, zIndex: 2 }, 2)]; break;
    default: kids = [S(B.e, { left: "10%", top: 48, fontSize: 54 }, 1), S(A.e, { left: "42%", top: 48, fontSize: 54 }, 2), S(C.e, { left: "74%", top: 48, fontSize: 54 }, 3)];
  }
  return <div className="scene">{kids}</div>;
}

function whereRounds(level) {
  const rels = level === 1 ? RELS1 : RELS2;
  return Array.from({ length: 8 }, () => {
    const rel = oneOf(rels);
    const [A, B, C, D] = shuffle(OBJ);
    const scene = <Scene rel={rel} A={A} B={B} C={C} />;
    if (level < 3) {
      const wrong = shuffle(rels.filter((r) => r !== rel)).slice(0, 3);
      const text = rel === "between" ? <>The {A.n} is <b>___</b> the {B.n} and the {C.n}.</> : <>The {A.n} is <b>___</b> the {B.n}.</>;
      return { prompt: <>{scene}<p className="prompt">{text}</p></>, opts: shuffle([{ label: rel, ok: true }, ...wrong.map((r) => ({ label: r, ok: false }))]) };
    }
    const right = sentence(A, rel, B, C);
    const pool = RELS2.filter((r) => r !== rel && (rel === "between" ? r !== "between" : r !== "between"));
    const cands = rel === "between"
      ? [sentence(A, "between", B, D), sentence(A, "between", D, C), sentence(A, "next to", B), sentence(A, "behind", C)]
      : [sentence(A, pool[Math.floor(Math.random() * pool.length)], B), sentence(A, oneOf(pool), B), sentence(A, rel, D), sentence(A, oneOf(pool), D), sentence(A, "next to", B)];
    const seen = new Set([right]);
    const wrong = [];
    for (const s of shuffle(cands)) { if (!seen.has(s)) { seen.add(s); wrong.push(s); } if (wrong.length === 3) break; }
    return { prompt: <>{scene}<p className="prompt">Where is the <b>{A.n}</b>?</p></>, opts: shuffle([{ label: right, ok: true }, ...wrong.map((s) => ({ label: s, ok: false }))]) };
  });
}
function Where({ level, finish }) {
  const rounds = useMemo(() => whereRounds(level), []);
  return <Quiz rounds={rounds} pts={10} finish={finish} />;
}

/* ================= RO'YXAT ================= */
export const NEW_GAMES = [
  { id: "errors", name: "Xatoni top", emoji: "🕵️", desc: "Gapdagi xato so'zni top va tuzat. 3 daraja.", color: "#E0559B", C: withLevels("errors", Errors, 80) },
  { id: "clock", name: "Soat ustasi", emoji: "🕒", desc: "Soatni o'qi va vaqtni inglizcha ayt.", color: "#3BA7FF", C: withLevels("clock", ClockGame, 80) },
  { id: "numbers", name: "Raqam ustasi", emoji: "🔢", desc: "Inglizcha yozilgan sonni raqam bilan yoz.", color: "#FF8A1F", C: withLevels("numbers", Numbers, 80) },
  { id: "verbs", name: "Fe'l formalari", emoji: "⏪", desc: "Fe'lning o'tgan zamon shaklini yoz.", color: "#8B5CF6", C: withLevels("verbs", Verbs, 80) },
  { id: "sort", name: "So'z turkumi", emoji: "🧺", desc: "Tushayotgan so'zni to'g'ri savatga tashla.", color: "#1FA89A", C: withLevels("sort", Sort, 80) },
  { id: "stroop", name: "Rang sinovi", emoji: "🎨", desc: "Aldanma: so'z va uning rangi har xil!", color: "#FF4D5E", C: withLevels("stroop", Stroop, 80) },
  { id: "odd", name: "Ortiqchasini top", emoji: "🧩", desc: "4 ta so'zdan o'zgacha birini top.", color: "#2FB457", C: withLevels("odd", Odd, 80) },
  { id: "story", name: "Voqea tartibi", emoji: "📖", desc: "Aralash gaplardan hikoya tuz.", color: "#F0A500", C: withLevels("story", Story, 78) },
  { id: "read", name: "O'qi va javob ber", emoji: "📰", desc: "Qisqa matnni o'qi va savollarga javob ber.", color: "#4B6BFB", C: withLevels("read", Read, 78) },
  { id: "where", name: "Qayerda?", emoji: "📍", desc: "Rasmga qarab to'g'ri predlogni tanla.", color: "#E36B2C", C: withLevels("where", Where, 80) },
];

export const NEW_CSS = `
.lvls{display:grid;gap:12px;max-width:420px;margin:0 auto}
.lvl{display:flex;flex-direction:column;gap:2px;text-align:left;background:#fff;border:3px solid var(--ink);border-radius:16px;padding:12px 16px;box-shadow:4px 4px 0 var(--ink);font-size:17px}
.lvl span{font-weight:600}.lvl small{font-weight:600;color:#6b6890}
.lvl.lock{opacity:.55;box-shadow:none;cursor:not-allowed}
.chip.opt{font-size:17px}
.chip.good{background:var(--leaf);color:#fff}.chip.bad{background:var(--red);color:#fff}
.emoopt{font-size:38px;line-height:1.2}
.explain{background:var(--cream);border:3px solid var(--ink);border-radius:14px;padding:10px 14px;margin:14px auto;max-width:460px;font-weight:600}
.passage{background:var(--cream);border:3px solid var(--ink);border-radius:14px;padding:12px 14px;text-align:left;font-weight:600;line-height:1.55;margin:12px 0}
.words{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0}
.word{background:#fff;border:3px solid var(--ink);border-radius:12px;padding:8px 12px;font:700 20px 'Nunito',sans-serif;box-shadow:3px 3px 0 var(--ink)}
.word.bad{background:var(--red);color:#fff}.word.fix{background:var(--leaf);color:#fff}
.bignum{font:400 28px 'Lilita One',sans-serif;background:var(--butter);border:3px solid var(--ink);border-radius:14px;padding:10px 14px;margin:8px auto;max-width:460px;line-height:1.3}
.verdict{font-weight:700;margin:4px 0 10px}.verdict.ok{color:#118a3e}.verdict.no{color:#c62828}
.scene{position:relative;height:150px;max-width:300px;margin:10px auto;background:#e8f6ff;border:3px solid var(--ink);border-radius:16px;overflow:hidden}
.scene span{position:absolute}
.fallzone{position:relative;height:250px;overflow:hidden;background:#eef7ff;border:3px solid var(--ink);border-radius:16px;margin:10px 0}
.fallcard{position:absolute;left:50%;top:0;transform:translateX(-50%);background:#fff;border:3px solid var(--ink);border-radius:14px;padding:8px 18px;font:400 28px 'Lilita One',sans-serif;box-shadow:3px 3px 0 var(--ink);animation:nfall var(--d) linear forwards}
.fallcard.good{background:var(--leaf);color:#fff}.fallcard.bad{background:var(--red);color:#fff}
@keyframes nfall{from{top:0}to{top:195px}}
.buckets{display:grid;gap:8px}
.bucket{display:flex;flex-direction:column;align-items:center;background:var(--butter);border:3px solid var(--ink);border-radius:14px;padding:10px 4px;box-shadow:3px 3px 0 var(--ink);font-size:17px}
.bucket small{font-weight:600;font-size:12px}
.tbar{height:10px;background:var(--red);border-radius:99px;transform-origin:left;animation:ndrain var(--d) linear forwards}
@keyframes ndrain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.inkword{font:400 clamp(44px,14vw,64px) 'Lilita One',sans-serif;margin:6px 0 12px;-webkit-text-stroke:1.5px rgba(27,27,58,.55);letter-spacing:1px}
.inkword.bad{opacity:.4}
.dot{aspect-ratio:1.6;border:3px solid var(--ink);border-radius:16px;box-shadow:3px 3px 0 var(--ink)}
.story{list-style:none;counter-reset:s;text-align:left;max-width:460px;margin:8px auto;padding:0}
.story li{counter-increment:s;background:var(--cream);border:3px solid var(--ink);border-radius:12px;padding:8px 12px;margin-bottom:6px;font-weight:700}
.story li::before{content:counter(s) ". ";color:var(--carrot)}
`;
export const NEW_DATA = { ERR, STORIES, READ, ODD3, REG, IRR, SORTW };
