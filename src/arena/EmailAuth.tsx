import { useState, type KeyboardEvent } from "react";
import { usernameSignIn, usernameSignUp } from "./cloud";

type Mode = "in" | "up";
type Props = { onStart: () => void; onFail: () => void };

export default function EmailAuth({ onStart, onFail }: Props) {
  const [mode, setMode] = useState<Mode>("in");
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;

    const name = username.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) {
      setMsg("Username 3–20 belgidan iborat bo‘lsin. Faqat harf, raqam va _ ishlat.");
      return;
    }

    if (pass.length < 6) {
      setMsg("Parol kamida 6 belgidan iborat bo‘lsin.");
      return;
    }

    if (mode === "up" && pass !== repeat) {
      setMsg("Parollar bir xil emas.");
      return;
    }

    setBusy(true);
    setMsg(null);
    onStart();

    try {
      const result =
        mode === "up"
          ? await usernameSignUp(name, pass)
          : await usernameSignIn(name, pass);

      if (result) {
        onFail();
        setMsg(result);
      }
    } catch {
      onFail();
      setMsg("Xatolik yuz berdi. Qayta urinib ko‘r.");
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="panel" style={{ textAlign: "left" }} onKeyDown={onKey}>
      <div className="row left">
        <button
          type="button"
          className={mode === "in" ? "btn sm" : "ghost"}
          onClick={() => { setMode("in"); setMsg(null); }}
        >
          Kirish
        </button>
        <button
          type="button"
          className={mode === "up" ? "btn sm" : "ghost"}
          onClick={() => { setMode("up"); setMsg(null); }}
        >
          Ro‘yxatdan o‘tish
        </button>
      </div>

      <label className="lbl" htmlFor="username">Username</label>
      <input
        id="username"
        type="text"
        autoComplete="username"
        className="typebox left"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Masalan: EnglishStar01"
      />

      <label className="lbl" htmlFor="password">Parol</label>
      <input
        id="password"
        type="password"
        autoComplete={mode === "up" ? "new-password" : "current-password"}
        className="typebox left"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="Kamida 6 belgi"
      />

      {mode === "up" && (
        <>
          <label className="lbl" htmlFor="repeat">Parolni takrorlang</label>
          <input
            id="repeat"
            type="password"
            autoComplete="new-password"
            className="typebox left"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            placeholder="Parolni qayta kiriting"
          />
        </>
      )}

      <p className="row left">
        <button className="btn" type="button" onClick={submit} disabled={busy}>
          {busy ? "Kuting..." : mode === "in" ? "Kirish" : "Hisob ochish"}
        </button>
      </p>

      {msg && <p className="lbl" role="alert">{msg}</p>}
    </div>
  );
}
