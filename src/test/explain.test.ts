import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ middleware() { return this; }, validator() { return this; }, handler: (h: unknown) => h }),
}));

import { cleanInput, MAX_INPUT } from "@/lib/explain.functions";

describe("explain input", () => {
  it("caps the student's text at 200 characters", () => {
    expect(MAX_INPUT).toBe(200);
    expect(cleanInput("a".repeat(500))).toHaveLength(200);
  });

  it("trims and collapses spaces", () => {
    expect(cleanInput("  I'm   looking  forward \n to it ")).toBe("I'm looking forward to it");
  });
});
