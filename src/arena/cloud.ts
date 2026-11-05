// Lovable Cloud connection for English Arena: Google sign-in, profiles and the group leaderboard.
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { Json } from "@/integrations/supabase/types";
// @ts-ignore - Arena is untyped game code
import { freshDaily } from "./Arena";

export const cloudOn = true;

export type LocalProfile = {
  name: string;
  group?: string;
  avatar: string;
  xp: number;
  streak: number;
  last: string;
  games: number;
  daily: unknown;
  registered?: boolean;
};

export type BoardRow = { id: string; name: string; avatar: string; xp: number };

export const GROUP_IDS = ["kichik", "orta", "katta"] as const;
export const safeGroup = (g?: string) => (GROUP_IDS as readonly string[]).includes(g ?? "") ? (g as string) : "kichik";

export async function signInGoogle(): Promise<string | null> {
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });
  if (result.error) {
    console.error("signInGoogle", result.error);
    return "Google bilan kirib bo'lmadi. Qaytadan urinib ko'r.";
  }
  return null;
}

export const signOut = () => supabase.auth.signOut();

export const toRow = (id: string, p: LocalProfile) => ({
  id,
  name: (p.name || "O'quvchi").slice(0, 18),
  grp: safeGroup(p.group),
  avatar: p.avatar,
  xp: Math.max(0, Math.floor(p.xp || 0)),
  streak: p.streak || 1,
  last_day: p.last || null,
  games: p.games || 0,
  daily: (p.daily ?? null) as Json,
  updated_at: new Date().toISOString(),
});

type Row = {
  name: string; grp: string; avatar: string; xp: number; streak: number;
  last_day: string | null; games: number; daily: Json | null;
};

export const fromRow = (r: Row): LocalProfile => ({
  name: r.name, group: r.grp, avatar: r.avatar, xp: r.xp, streak: r.streak,
  last: r.last_day ?? "", games: r.games, daily: r.daily || freshDaily(), registered: true,
});

export async function fetchProfile(id: string): Promise<LocalProfile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) { console.error("fetchProfile", error); return null; }
  return data ? fromRow(data) : null;
}

export async function saveProfile(id: string, p: LocalProfile) {
  const { error } = await supabase.from("profiles").upsert(toRow(id, p));
  if (error) console.error("saveProfile", error);
}

export async function fetchBoard(group: string): Promise<BoardRow[] | null> {
  const { data, error } = await supabase
    .from("profiles").select("id,name,avatar,xp")
    .eq("grp", safeGroup(group)).order("xp", { ascending: false }).limit(50);
  if (error) { console.error("fetchBoard", error); return null; }
  return data;
}

// ---- Email + parol bilan kirish (Google ishlamaganda zaxira yo'l) ----
const authMsg = (m?: string) => {
  const s = (m || "").toLowerCase();
  if (s.includes("invalid login")) return "Email yoki parol noto'g'ri.";
  if (s.includes("not confirmed")) return "Avval emailingga kelgan havolani bosib tasdiqla.";
  if (s.includes("already registered") || s.includes("already been registered")) return "Bu email bilan hisob bor. \"Kirish\"ni tanla.";
  if (s.includes("password") && (s.includes("6") || s.includes("short") || s.includes("weak"))) return "Parol kamida 6 belgidan iborat bo'lsin (oddiy parollar qabul qilinmaydi).";
  if (s.includes("not allowed") || s.includes("invalid") && s.includes("email")) return "Bu email manzil qabul qilinmaydi. Haqiqiy emailingni yoz.";
  if (s.includes("rate limit") || s.includes("too many")) return "Juda ko'p urinish. Birozdan keyin qayta urinib ko'r.";
  return "Xatolik yuz berdi. Qaytadan urinib ko'r.";
};

export async function emailSignIn(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) { console.error("emailSignIn", error); return authMsg(error.message); }
  return null;
}

/** Returns { error } or { needsConfirm } — email tasdiqlanmaguncha sessiya bo'lmaydi. */
export async function emailSignUp(email: string, password: string): Promise<{ error: string | null; needsConfirm: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(), password, options: { emailRedirectTo: window.location.origin },
  });
  if (error) { console.error("emailSignUp", error); return { error: authMsg(error.message), needsConfirm: false }; }
  return { error: null, needsConfirm: !data.session };
}

export async function emailReset(email: string): Promise<string | null> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) { console.error("emailReset", error); return authMsg(error.message); }
  return null;
}
