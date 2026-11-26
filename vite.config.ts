import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    target: "chrome120",
    cssTarget: "chrome120",
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "wear-m3e-vue",
      cssFileName: "style",
    },
    rolldownOptions: { external: ["vue"] },
  },
});
