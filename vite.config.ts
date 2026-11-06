import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: process.env.VERCEL
    ? { preset: "vercel" }
    : true,
});
