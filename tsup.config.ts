import { defineConfig } from "tsup";

export default defineConfig({
    target: "es2021",
    entry: ["src/index.ts"],
    external: ["coc.nvim"],
    sourcemap: true,
    minify: true
});