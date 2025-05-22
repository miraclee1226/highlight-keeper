import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.html"),
        "content-script": resolve(__dirname, "src/content/content.js"),
        "content-style": resolve(__dirname, "src/content/content.css"),
        background: resolve(__dirname, "src/background/background.js"),
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
