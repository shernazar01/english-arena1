import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/integrations/lovable/index", () => ({ lovable: { auth: {} } }));

import { toRow, fromRow, safeGroup } from "@/arena/cloud";

const local = {
  name: "Aziza", group: "orta", avatar: "🦄", xp: 140, streak: 3,
  last: "2026-11-03", games: 5, daily: { date: "2026-11-03", games: 2, xp: 60, perfect: 1, claimed: ["g2"] },
  registered: true,
};

describe("profile saving", () => {
  it("saves xp, streak, games and daily tasks into the profiles row", () => {
    const row = toRow("user-1", local);
    expect(row).toMatchObject({
      id: "user-1", name: "Aziza", grp: "orta", avatar: "🦄", xp: 140, streak: 3,
      last_day: "2026-11-03", games: 5, daily: local.daily,
    });
  });

  it("only allows the groups kichik, orta and katta", () => {
    expect(safeGroup("katta")).toBe("katta");
    expect(safeGroup("admin")).toBe("kichik");
  });

  it("reads a saved row back as a registered profile", () => {
    const back = fromRow({ ...toRow("user-1", local) });
    expect(back).toMatchObject({ name: "Aziza", group: "orta", xp: 140, streak: 3, last: "2026-11-03", registered: true });
  });
});
