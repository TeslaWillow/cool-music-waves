// ./vite.config.ts (en el proyecto cool-music-waves)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "CoolMusicWaves",
      fileName: (format) => `index.${format === "es" ? "es.js" : "umd.js"}`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      // Avoid bundling React and Three.js inside the library
      external: ["react", "react/jsx-runtime", "react-dom", "three"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          three: "THREE",
        },
      },
    },
  },
});
