import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        "content-script": resolve(__dirname, "src/content/content.js"),
        "content-style": resolve(__dirname, "src/content/content.css"),
        background: resolve(__dirname, "src/background/background.js"),
        "side-panel": resolve(__dirname, "src/side-panel.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
    outDir: "dist",
  },
});
