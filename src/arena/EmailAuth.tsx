import { useState, type KeyboardEvent } from "react";
import { emailSignIn, emailSignUp, emailReset } from "./cloud";

type Mode = "in" | "up" | "reset";
type Props = { onStart: () => void; onFail: () => void };

// Google ishlamasa: email + parol bilan kirish / ro'yxatdan o'tish
export default function EmailAuth({ onStart, onFail }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!open) {
    return <button type="button" className="ghost" onClick={() => setOpen(true)}>✉️ Email bilan kirish</button>;
  }

  // Bu blok ro'yxatdan o'tish formasi ichida turadi, shuning uchun alohida <form> emas.
  const submit = async () => {
    if (busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setMsg("Email manzilini to'g'ri yoz."); return; }
    if (mode !== "reset" && pass.length < 6) { setMsg("Parol kamida 6 belgidan iborat bo'lsin."); return; }
    setBusy(true); setMsg(null);
    try {
      if (mode === "reset") {
        const err = await emailReset(email);
        setMsg(err || "Emailingga parolni tiklash havolasi yuborildi. 📬");
      } else if (mode === "up") {
        onStart();
        const r = await emailSignUp(email, pass);
        if (r.error) { onFail(); setMsg(r.error); }
        else if (r.needsConfirm) { onFail(); setMsg("Emailingga tasdiqlash havolasi yuborildi. Havolani bosgach, shu sahifaga qaytasan. 📬"); }
      } else {
        onStart();
        const err = await emailSignIn(email, pass);
        if (err) { onFail(); setMsg(err); }
      }
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") { e.preventDefault(); submit(); } };
  const tabs: [Mode, string][] = [["in", "Kirish"], ["up", "Ro'yxatdan o'tish"]];
  return (
    <div className="panel" style={{ textAlign: "left" }} onKeyDown={onKey}>
      <div className="row left">
        {tabs.map(([m, l]) => (
          <button key={m} type="button" className={mode === m ? "btn sm" : "ghost"} onClick={() => { setMode(m); setMsg(null); }}>{l}</button>
        ))}
      </div>
      <label className="lbl" htmlFor="em">Email</label>
      <input id="em" type="email" required autoComplete="email" className="typebox left" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="masalan: aziza@gmail.com" />
      {mode !== "reset" && <>
        <label className="lbl" htmlFor="pw">Parol</label>
        <input id="pw" type="password" required minLength={6} autoComplete={mode === "up" ? "new-password" : "current-password"}
          className="typebox left" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="kamida 6 belgi" />
      </>}
      <p className="row left">
        <button className="btn" type="button" onClick={submit} disabled={busy}>
          {busy ? "Kuting..." : mode === "in" ? "Kirish" : mode === "up" ? "Hisob ochish" : "Havola yuborish"}
        </button>
        {mode === "in" && <button type="button" className="ghost" onClick={() => { setMode("reset"); setMsg(null); }}>Parolni unutdim</button>}
        {mode === "reset" && <button type="button" className="ghost" onClick={() => { setMode("in"); setMsg(null); }}>← Orqaga</button>}
      </p>
      {msg && <p className="lbl" role="alert">{msg}</p>}
    </div>
  );
}
