import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { explainEnglish, MAX_INPUT, type Explanation } from "@/lib/explain.functions";

type Props = { signedIn: boolean };

export default function Explain({ signedIn }: Props) {
  const explain = useServerFn(explainEnglish);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<{ q: string; a: Explanation } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    if (!q || busy) return;

    setBusy(true);
    setErr(null);

    try {
      const r = await explain({ data: { text: q } });

      if (r.ok) {
        setRes({ q, a: r.data });
      } else {
        setErr(r.error);
      }
    } catch (e2) {
      console.error(e2);
      setErr("Tushuntirib bo'lmadi. Qaytadan urinib ko'r.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <h2 className="sec">🤖 So'z yordamchisi</h2>

      <p className="lbl">
        Inglizcha so'z yoki gap yoz — o'zbekcha tushuntirib,
        misol bilan ko'rsatib beraman.
      </p>

      {!signedIn ? (
        <div className="panel" style={{ textAlign: "center" }}>
          <p className="lbl">
            Yordamchidan foydalanish uchun avval username va parol
            bilan hisobingga kir.
          </p>
          <a href="#/start" className="btn">
            Hisobga kirish
          </a>
        </div>
      ) : (
        <form onSubmit={submit}>
          <input
            className="typebox left"
            maxLength={MAX_INPUT}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Masalan: brave yoki I'm looking forward to it"
            aria-label="Inglizcha so'z yoki gap"
          />

          <p>
            <button
              className="btn big"
              type="submit"
              disabled={busy || !text.trim()}
            >
              {busy ? "O'ylayapman... ⏳" : "Tushuntir ✨"}
            </button>
          </p>

          {err && (
            <p className="lbl" role="alert">
              {err}
            </p>
          )}
        </form>
      )}

      {res && (
        <div className="panel" aria-live="polite">
          <p className="lbl">📘 {res.q}</p>
          <p>{res.a.meaning_uz}</p>

          <p className="lbl">Misol:</p>
          <p><b>{res.a.example_en}</b></p>
          <p>{res.a.example_uz}</p>
        </div>
      )}
    </div>
  );
}
