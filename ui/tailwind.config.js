/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0e1015",
          1: "#14171e",
          2: "#1a1e27",
          3: "#222733",
          4: "#2a3040",
        },
        border: {
          DEFAULT: "#262c38",
          strong: "#323a4a",
          focus: "#4c8dff",
        },
        txt: {
          1: "#e2e8f0",
          2: "#94a3b8",
          3: "#64748b",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          muted: "#1e3a5f",
        },
        status: {
          ok: "#22c55e",
          error: "#ef4444",
          warn: "#f59e0b",
        },
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "0.85rem" }],
      },
    },
  },
  plugins: [],
};
