// @ts-nocheck
import { useState, useEffect, useMemo, useRef } from "react";
import { WORDS, shuffle, freshWords, freshSents, options, oneOf } from "./Data";

// Yordam turlari: har so'z uchun rasm, o'zbekcha yoki ikkalasi ko'rsatiladi (tasodifiy)
const HINTS = ["both", "both", "emoji", "uz"];
const Hint = ({ w, h }) => (
  <>
    {h !== "uz" && <div className="bigemo">{w.e}</div>}
    {h !== "emoji" && <p className="prompt">{w.uz}</p>}
  </>
);

/* 1. Harf teruvchi: harflarni tartib bilan bos */
function Letters({ finish }) {
  const words = useMemo(() => freshWords(5, (w) => w.en.length <= 8), []);
  const hints = useMemo(() => words.map(() => oneOf(HINTS)), [words]);
  const [i, setI] = useState(0);
  const [got, setGot] = useState([]);
  const [wrong, setWrong] = useState(0);
  const w = words[i];
  const bank = useMemo(() => shuffle([...w.en].map((c, k) => ({ c, k }))), [i]);
  const tap = (l) => {
    if (got.includes(l.k) || l.c !== w.en[got.length]) { if (!got.includes(l.k)) setWrong((x) => x + 1); return; }
    const n = [...got, l.k];
    setGot(n);
    if (n.length === w.en.length) setTimeout(() => {
      if (i === 4) finish(Math.max(10, 60 - wrong * 4), wrong === 0); else { setI(i + 1); setGot([]); }
    }, 500);
  };
  return (
    <div className="center">
      <div className="hud"><span>❌ {wrong}</span><span>{i + 1}/5</span></div>
      <Hint w={w} h={hints[i]} />
      <div className="slots">{[...w.en].map((c, k) => <span key={k} className="slot">{got[k] !== undefined ? c : ""}</span>)}</div>
      <div className="bank">{bank.map((l) => (
        <button key={l.k} className="chip drag" disabled={got.includes(l.k)} onClick={() => tap(l)}>{l.c}</button>))}</div>
    </div>
  );
}

/* 2. Yozish poygasi: klaviaturada yoz (har so'z boshqacha ko'rinishda beriladi) */
function Typing({ finish }) {
  const words = useMemo(() => freshWords(8), []);
  const kinds = useMemo(() => words.map(() => oneOf(["uz", "emoji", "copy"])), [words]);
  const [i, setI] = useState(0);
  const [v, setV] = useState("");
  const [ok, setOk] = useState(0);
  const [bad, setBad] = useState(false);
  const [t, setT] = useState(60);
  useEffect(() => { const id = setInterval(() => setT((x) => (x > 0 ? x - 1 : 0)), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { if (t === 0) finish(ok * 10, false); }, [t]);
  const w = words[i];
  const k = kinds[i];
  const next = (good) => {
    const n = ok + (good ? 1 : 0);
    setV("");
    if (i === 7) finish(n * 10, n === 8); else { setOk(n); setI(i + 1); }
  };
  const submit = (e) => {
    e.preventDefault();
    if (v.trim().toLowerCase() === w.en) next(true);
    else { setBad(true); setTimeout(() => setBad(false), 400); }
  };
  return (
    <div className="center">
      <div className="hud"><span>⏱ {t}s</span><span>✅ {ok}</span></div>
      {k === "emoji" && <><div className="bigemo">{w.e}</div><p className="prompt">Inglizchasini yoz <small>({w.en.length} harf)</small></p></>}
      {k === "uz" && <p className="prompt">{w.uz} <small>({w.en.length} harf)</small></p>}
      {k === "copy" && <p className="prompt">Ko'chirib yoz: <b>{w.en}</b></p>}
      <form onSubmit={submit}>
        <input className={"typebox" + (bad ? " shake" : "")} autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="Inglizchasini yoz..." />
        <div className="row"><button className="btn" type="submit">Tekshir</button>
          <button className="ghost" type="button" onClick={() => next(false)}>O'tkazib yubor</button></div>
      </form>
    </div>
  );
}

/* 3. Mashina poygasi: to'g'ri javob = mashina oldinga (savol turi har safar boshqacha) */
function Race({ finish }) {
  const qs = useMemo(() => freshWords(8).map((w) => ({ w, mode: oneOf(["emoji", "uz", "en"]), opts: options(w) })), []);
  const [i, setI] = useState(0);
  const [me, setMe] = useState(0);
  const [bot, setBot] = useState(0);
  const [ok, setOk] = useState(0);
  const over = useRef(false);
  useEffect(() => { const id = setInterval(() => setBot((b) => b + 1), 6000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (over.current) return;
    if (me >= 8) { over.current = true; finish(ok * 10 + (bot < 8 ? 20 : 0), ok === 8); }
    else if (bot >= 8 || i >= 8) { over.current = true; finish(ok * 10, false); }
  }, [me, bot, i]);
  if (i >= 8) return null;
  const q = qs[i];
  const toUz = q.mode === "en";
  const pickOpt = (o) => { if (o.en === q.w.en) { setMe((m) => m + 1); setOk((x) => x + 1); } setI(i + 1); };
  return (
    <div>
      <div className="track"><span style={{ left: me * 11 + "%" }}>🏎️</span><span style={{ left: bot * 11 + "%", top: 38 }}>🚙</span><em>🏁</em></div>
      {q.mode === "emoji" ? <div className="bigemo">{q.w.e}</div> : <p className="prompt"><b>{q.mode === "uz" ? q.w.uz : q.w.en}</b></p>}
      <p className="prompt">{toUz ? "Bu o'zbekchada nima?" : "Bu inglizchada nima?"}</p>
      <div className="opts">{q.opts.map((o) => <button key={o.en} className="chip" onClick={() => pickOpt(o)}>{toUz ? o.uz : o.en}</button>)}</div>
    </div>
  );
}

/* 4. Sehrli so'z: harf topish, 6 ta jon */
function Hang({ finish }) {
  const rounds = useMemo(() => freshWords(3), []);
  const hints = useMemo(() => rounds.map(() => oneOf(HINTS)), [rounds]);
  const [r, setR] = useState(0);
  const [g, setG] = useState([]);
  const [lives, setLives] = useState(6);
  const [won, setWon] = useState(0);
  const [miss, setMiss] = useState(0);
  const w = rounds[r].en;
  const next = (win) => {
    const nw = won + (win ? 1 : 0);
    if (r === 2) finish(nw * 20, nw === 3 && miss === 0);
    else { setWon(nw); setR(r + 1); setG([]); setLives(6); }
  };
  const press = (ch) => {
    if (g.includes(ch) || lives === 0) return;
    const ng = [...g, ch];
    setG(ng);
    if (!w.includes(ch)) { setMiss((m) => m + 1); const l = lives - 1; setLives(l); if (l === 0) setTimeout(() => next(false), 900); }
    else if ([...w].every((c) => ng.includes(c))) setTimeout(() => next(true), 500);
  };
  return (
    <div className="center">
      <div className="hud"><span>{"❤️".repeat(lives) || "💔"}</span><span>{r + 1}/3</span></div>
      <Hint w={rounds[r]} h={hints[r]} />
      <div className="slots">{[...w].map((c, k) => <span key={k} className="slot">{g.includes(c) || lives === 0 ? c : ""}</span>)}</div>
      <div className="kb">{"abcdefghijklmnopqrstuvwxyz".split("").map((c) => (
        <button key={c} className={"key" + (g.includes(c) ? (w.includes(c) ? " yes" : " no") : "")} onClick={() => press(c)}>{c}</button>))}</div>
    </div>
  );
}

/* 5. Gap tuzish: so'zlarni tartibga sol (50 ta gapdan har safar yangilari) */
function Sentence({ finish }) {
  const qs = useMemo(() => freshSents(5), []);
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [wrong, setWrong] = useState(0);
  const words = useMemo(() => shuffle(qs[i][0].split(" ").map((w, k) => ({ w, k }))), [i]);
  const check = () => {
    if (placed.map((k) => words.find((x) => x.k === k).w).join(" ") === qs[i][0]) {
      if (i === 4) finish(Math.max(10, 60 - wrong * 6), wrong === 0); else { setI(i + 1); setPlaced([]); }
    } else { setWrong((x) => x + 1); setPlaced([]); }
  };
  return (
    <div className="center">
      <div className="hud"><span>❌ {wrong}</span><span>{i + 1}/5</span></div>
      <p className="prompt">Inglizchaga o'gir: <b>{qs[i][1]}</b></p>
      <div className="line">{placed.map((k) => (
        <button key={k} className="chip drag" onClick={() => setPlaced(placed.filter((x) => x !== k))}>{words.find((x) => x.k === k).w}</button>))}</div>
      <div className="bank">{words.filter((x) => !placed.includes(x.k)).map((x) => (
        <button key={x.k} className="chip" onClick={() => setPlaced([...placed, x.k])}>{x.w}</button>))}</div>
      <button className="btn" disabled={placed.length !== words.length} onClick={check}>Tekshir</button>
    </div>
  );
}

/* 6. Ha yoki yo'q: 3 soniyada javob ber (tarjima yoki rasm bo'yicha) */
function TrueFalse({ finish }) {
  const qs = useMemo(() => freshWords(15).map((w) => {
    const t = Math.random() < 0.5;
    const other = shuffle(WORDS.filter((x) => x.en !== w.en))[0];
    return { w, t, kind: oneOf(["uz", "emoji"]), uz: t ? w.uz : other.uz, e: t ? w.e : other.e };
  }), []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [st, setSt] = useState(0);
  const [miss, setMiss] = useState(0);
  const q = qs[i];
  const answer = (v) => {
    const good = v === q.t;
    const ns = good ? st + 1 : 0;
    const sc = score + (good ? 5 + (ns >= 3 ? 2 : 0) : 0);
    setSt(ns); setScore(sc);
    if (!good) setMiss((m) => m + 1);
    if (i === 14) finish(sc, miss === 0 && good); else setI(i + 1);
  };
  useEffect(() => { const id = setTimeout(() => answer(null), 3000); return () => clearTimeout(id); }, [i]);
  return (
    <div className="center">
      <div className="hud"><span>🔥 {st}</span><span>⭐ {score}</span></div>
      <div key={i} className="timebar" />
      {q.kind === "emoji"
        ? <><div className="bigemo">{q.e}</div><p className="prompt">Bu rasm <b>{q.w.en}</b> degani to'g'rimi?</p></>
        : <><div className="bigemo">❓</div><p className="prompt"><b>{q.w.en}</b> = {q.uz}</p></>}
      <div className="row"><button className="btn tf yes" onClick={() => answer(true)}>✔ Ha</button>
        <button className="btn tf no" onClick={() => answer(false)}>✖ Yo'q</button></div>
    </div>
  );
}

/* 7. So'z qidirish: harflar katagidan so'z top */
function Search({ finish }) {
  const N = 8;
  const { grid, words } = useMemo(() => {
    const g = Array(N * N).fill("");
    const placed = [];
    freshWords(4, (w) => w.en.length <= 7).forEach((w) => {
      const t = w.en.toUpperCase();
      for (let k = 0; k < 200; k++) {
        const h = Math.random() < 0.5;
        const r = Math.floor(Math.random() * (h ? N : N - t.length + 1));
        const c = Math.floor(Math.random() * (h ? N - t.length + 1 : N));
        const idx = [...t].map((_, j) => (h ? r * N + c + j : (r + j) * N + c));
        if (idx.every((x, j) => g[x] === "" || g[x] === t[j])) { idx.forEach((x, j) => (g[x] = t[j])); placed.push(w); break; }
      }
    });
    const L = "ABCDEFGHIJKLMNOPRSTUWY";
    return { grid: g.map((x) => x || L[Math.floor(Math.random() * L.length)]), words: placed };
  }, []);
  const clue = useMemo(() => oneOf(["both", "uz", "emoji"]), []);
  const [sel, setSel] = useState([]);
  const [found, setFound] = useState([]);
  const [cells, setCells] = useState([]);
  const [clr, setClr] = useState(0);
  useEffect(() => { if (found.length === words.length) finish(Math.max(20, 60 - clr * 3), clr === 0); }, [found]);
  const tap = (i) => {
    if (sel.includes(i) || cells.includes(i)) return;
    const n = [...sel, i];
    const s = n.map((x) => grid[x]).join("").toLowerCase();
    const hit = words.find((w) => !found.includes(w.en) && (w.en === s || [...w.en].reverse().join("") === s));
    if (hit) { setFound((f) => [...f, hit.en]); setCells((c) => [...c, ...n]); setSel([]); } else setSel(n);
  };
  return (
    <div className="center">
      <div className="hud"><span>🔎 {found.length}/{words.length}</span><button className="ghost" onClick={() => { setSel([]); setClr((c) => c + 1); }}>Tozalash</button></div>
      <p className="prompt">Topish kerak: {words.map((w) => (
        <span key={w.en} className={"find" + (found.includes(w.en) ? " got" : "")}>{clue !== "uz" ? w.e : ""} {clue !== "emoji" ? w.uz : ""}</span>))}</p>
      <div className="wgrid">{grid.map((c, i) => (
        <button key={i} className={"cell" + (sel.includes(i) ? " sel" : "") + (cells.includes(i) ? " ok" : "")} onClick={() => tap(i)}>{c}</button>))}</div>
    </div>
  );
}

/* 8. Eshitib top: so'zni tingla, rasmni yoki tarjimasini tanla */
function Listen({ finish }) {
  const qs = useMemo(() => freshWords(8).map((w) => ({ w, mode: oneOf(["pic", "uz"]), opts: options(w) })), []);
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance(qs[i].w.en);
      u.lang = "en-US"; u.rate = 0.85;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) {}
  };
  useEffect(() => { speak(); }, [i]);
  const answer = (o) => {
    const n = ok + (o.en === qs[i].w.en ? 1 : 0);
    if (i === 7) finish(n * 10, n === 8); else { setOk(n); setI(i + 1); }
  };
  const q = qs[i];
  return (
    <div className="center">
      <div className="hud"><span>✅ {ok}</span><span>{i + 1}/8</span></div>
      <button className="btn speaker" onClick={speak}>🔊 Tingla</button>
      <p className="prompt">{q.mode === "pic" ? "Eshitgan so'zingga mos rasmni tanla" : "Eshitgan so'zingning tarjimasini tanla"}</p>
      <div className="opts">{q.opts.map((o) => (
        <button key={o.en} className={"chip" + (q.mode === "pic" ? " emochip" : "")} onClick={() => answer(o)}>{q.mode === "pic" ? o.e : o.uz}</button>))}</div>
    </div>
  );
}

export const MORE_GAMES = [
  { id: "letters", name: "Harf teruvchi", emoji: "🔤", desc: "Harflarni to'g'ri tartibda bos.", color: "#B26BFF", C: Letters },
  { id: "typing", name: "Yozish poygasi", emoji: "⌨️", desc: "60 soniyada iloji boricha ko'p so'z yoz.", color: "#2FB457", C: Typing },
  { id: "race", name: "Mashina poygasi", emoji: "🏎️", desc: "To'g'ri javob bersang mashinang oldinga yuradi.", color: "#FF4D5E", C: Race },
  { id: "hang", name: "Sehrli so'z", emoji: "🪄", desc: "Harflarni topib so'zni och, 6 ta jon bor.", color: "#3BA7FF", C: Hang },
  { id: "sentence", name: "Gap tuz", emoji: "🧩", desc: "So'zlarni tartibga solib gap yasa.", color: "#F2A900", C: Sentence },
  { id: "tf", name: "Ha yoki yo'q", emoji: "⚡", desc: "3 soniyada to'g'ri yoki xato de!", color: "#FF8A1F", C: TrueFalse },
  { id: "search", name: "So'z qidirish", emoji: "🔎", desc: "Harflar orasidan yashirin so'zlarni top.", color: "#1FA89A", C: Search },
  { id: "listen", name: "Eshitib top", emoji: "🎧", desc: "So'zni eshit va to'g'ri rasmni tanla.", color: "#E0559B", C: Listen },
];

export const MORE_CSS = `
.center{text-align:center}
.bigemo{font-size:clamp(64px,18vw,96px);margin:8px 0}
.slots{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:10px 0}
.slot{width:38px;height:48px;border-bottom:5px solid var(--carrot);font:800 28px 'Baloo 2',sans-serif;display:grid;place-items:center;text-transform:uppercase}
.typebox{width:100%;max-width:360px;font:800 24px 'Baloo 2',sans-serif;text-align:center;padding:12px;border:4px solid var(--butter);border-radius:16px;margin-bottom:12px;color:var(--ink)}
.track{position:relative;height:84px;background:#d9efe0;border-radius:16px;margin-bottom:6px;overflow:hidden}
.track span{position:absolute;top:4px;font-size:32px;transition:left .5s}
.track em{position:absolute;right:6px;top:20px;font-size:32px;font-style:normal}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:420px;margin:0 auto}
.emochip{font-size:48px;padding:14px}
.kb{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:460px;margin:8px auto}
.key{width:40px;height:44px;border-radius:12px;background:var(--butter);font:800 18px 'Nunito',sans-serif;color:var(--ink);text-transform:uppercase}
.key.yes{background:var(--leaf);color:#fff}.key.no{background:var(--red);color:#fff;opacity:.6}
.line{min-height:56px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;border-bottom:4px dashed var(--butter);padding-bottom:10px;margin-bottom:10px}
.timebar{height:10px;background:var(--red);border-radius:99px;transform-origin:left;animation:drain 3s linear forwards}
@keyframes drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.tf{font-size:22px;padding:16px 28px}.tf.yes{background:var(--leaf)}.tf.no{background:var(--red)}
.wgrid{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;max-width:400px;margin:10px auto}
.cell{aspect-ratio:1;border-radius:10px;background:var(--butter);font:800 clamp(14px,4vw,20px) 'Nunito',sans-serif;color:var(--ink)}
.cell.sel{background:var(--carrot);color:#fff}.cell.ok{background:var(--leaf);color:#fff}
.find{display:inline-block;background:var(--butter);border-radius:10px;padding:2px 10px;margin:3px;font-size:16px}
.find.got{background:var(--leaf);color:#fff;text-decoration:line-through}
.speaker{font-size:26px;padding:18px 34px;margin:12px 0}
`;
