import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore - untyped theme string
import { THEME_CSS } from "@/arena/Theme";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Yangi parol — English Arena" },
      { name: "description", content: "English Arena hisobing uchun yangi parol o'rnat." },
      { property: "og:title", content: "Yangi parol — English Arena" },
      { property: "og:description", content: "English Arena hisobing uchun yangi parol o'rnat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly fallback={<div className="arena-loading">🏟️ English Arena…</div>}>
      <ResetPassword />
    </ClientOnly>
  ),
});

function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && window.location.hash.includes("type=recovery"))) setReady(true);
      else if (session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setBusy(false);
    if (error) { console.error(error); setMsg("Parolni saqlab bo'lmadi. Parol kamida 6 belgi bo'lsin va oddiy bo'lmasin."); return; }
    setDone(true);
  };

  return (
    <div className="app site">
      <style>{THEME_CSS}</style>
      <header className="top"><a className="logo" href="/#/games">🏟️ English Arena</a></header>
      <main>
        <form className="panel" onSubmit={submit}>
          <h2 className="sec">Yangi parol 🔑</h2>
          {done ? (
            <><p className="lbl">Parol yangilandi! ✅</p><p><a className="btn" href="/#/games">O'yinlarga o'tish</a></p></>
          ) : !ready ? (
            <p className="lbl">Havola tekshirilmoqda... Agar uzoq kutsang, emailingdagi havolani qaytadan och.</p>
          ) : (
            <>
              <label className="lbl" htmlFor="np">Yangi parol</label>
              <input id="np" type="password" required minLength={6} autoComplete="new-password" className="typebox left"
                value={pass} onChange={(e) => setPass(e.target.value)} placeholder="kamida 6 belgi" />
              <p><button className="btn big" type="submit" disabled={busy}>{busy ? "Kuting..." : "Saqlash"}</button></p>
              {msg && <p className="lbl" role="alert">{msg}</p>}
            </>
          )}
        </form>
      </main>
    </div>
  );
}
