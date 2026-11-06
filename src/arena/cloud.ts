
// English Arena Cloud connection: username login, profiles and leaderboard.

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

export type BoardRow = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
};

export const GROUP_IDS = ["kichik", "orta", "katta"] as const;

export const safeGroup = (g?: string) =>
  (GROUP_IDS as readonly string[]).includes(g ?? "")
    ? (g as string)
    : "kichik";

// Eski Site.tsx bilan vaqtincha moslik uchun.
// Keyin Google kirishini ham butunlay olib tashlaymiz.
export async function signInGoogle(): Promise<string | null> {
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });

  if (result.error) {
    console.error("signInGoogle", result.error);
    return "Google orqali kirib bo‘lmadi.";
  }

  return null;
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("signOut", error);
};

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
  name: string;
  grp: string;
  avatar: string;
  xp: number;
  streak: number;
  last_day: string | null;
  games: number;
  daily: Json | null;
};

export const fromRow = (r: Row): LocalProfile => ({
  name: r.name,
  group: r.grp,
  avatar: r.avatar,
  xp: r.xp,
  streak: r.streak,
  last: r.last_day ?? "",
  games: r.games,
  daily: r.daily || freshDaily(),
  registered: true,
});

export async function fetchProfile(
  id: string
): Promise<LocalProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchProfile", error);
    return null;
  }

  return data ? fromRow(data) : null;
}

export async function saveProfile(id: string, p: LocalProfile) {
  const { error } = await supabase
    .from("profiles")
    .upsert(toRow(id, p));

  if (error) console.error("saveProfile", error);
}

export async function fetchBoard(
  group: string
): Promise<BoardRow[] | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,avatar,xp")
    .eq("grp", safeGroup(group))
    .order("xp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("fetchBoard", error);
    return null;
  }

  return data;
}

// Username uchun ichki texnik email.
// Foydalanuvchi haqiqiy email kiritmaydi.
function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@users.english-arena.invalid`;
}

function authMsg(message?: string) {
  const s = (message || "").toLowerCase();

  if (s.includes("invalid login")) {
    return "Username yoki parol noto‘g‘ri.";
  }

  if (
    s.includes("already registered") ||
    s.includes("already been registered")
  ) {
    return "Bu username band. Boshqasini tanla yoki tizimga kir.";
  }

  if (s.includes("password")) {
    return "Parol kamida 6 belgidan iborat bo‘lsin.";
  }

  if (s.includes("rate limit") || s.includes("too many")) {
    return "Juda ko‘p urinish. Birozdan keyin qayta urin.";
  }

  if (s.includes("email")) {
    return "Ro‘yxatdan o‘tish sozlamasida xatolik. Administrator tekshirishi kerak.";
  }

  return "Xatolik yuz berdi. Qaytadan urinib ko‘r.";
}

export async function usernameSignUp(
  username: string,
  password: string
): Promise<string | null> {
  const cleanUsername = username.trim().toLowerCase();

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
    return "Username 3–20 belgidan iborat bo‘lsin.";
  }

  if (password.length < 6) {
    return "Parol kamida 6 belgidan iborat bo‘lsin.";
  }

  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(cleanUsername),
    password,
    options: {
      data: {
        username: cleanUsername,
      },
    },
  });

  if (error) {
    console.error("usernameSignUp", error);
    return authMsg(error.message);
  }

  if (!data.session) {
    return "Email tasdiqlash yoqilgan. Username orqali kirish uchun bu sozlamani o‘zgartirish kerak.";
  }

  return null;
}

export async function usernameSignIn(
  username: string,
  password: string
): Promise<string | null> {
  const cleanUsername = username.trim().toLowerCase();

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
    return "Username noto‘g‘ri.";
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(cleanUsername),
    password,
  });

  if (error) {
    console.error("usernameSignIn", error);
    return authMsg(error.message);
  }

  return null;
}
