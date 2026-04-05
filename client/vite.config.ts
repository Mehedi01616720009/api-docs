import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: "/api-docs/",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: [
                        "react",
                        "react-dom",
                        "react-router-dom",
                        "marked",
                        "shiki",
                        "lucide-react",
                        "tailwindcss",
                    ],
                },
            },
        },
    },
    server: {
        port: 3001,
        proxy: {
            "/api-docs/config.json": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
        },
    },
});
