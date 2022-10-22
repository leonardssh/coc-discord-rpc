import { defineConfig } from "tsup";

export default defineConfig({
    target: "esnext",
    entry: ["src/index.ts"],
    external: ["coc.nvim"],
    sourcemap: true,
    minify: true
});