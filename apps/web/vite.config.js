// Vite no lugar do Create React App (react-scripts, parado desde 2022).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Arquivos com JSX usam .jsx (no CRA ficavam em .js).
  plugins: [react()],
  // Mantém o nome da variável de deploy (REACT_APP_API_BASE_URL).
  envPrefix: ["VITE_", "REACT_APP_"],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    // Pasta montada do macOS no container: sem polling o Vite não vê mudanças.
    watch: { usePolling: Boolean(process.env.WATCHPACK_POLLING || process.env.CHOKIDAR_USEPOLLING) },
  },
  // Mesma pasta de saída do CRA: o deploy continua publicando build/.
  build: { outDir: "build" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
