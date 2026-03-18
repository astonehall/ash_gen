/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#09090f",
          1: "#11111a",
          2: "#171724",
          3: "#222235",
          4: "#2a2a41",
        },
        border: {
          DEFAULT: "#27273c",
          strong: "#3a3a57",
          focus: "#8b5cf6",
        },
        txt: {
          1: "#f3f0ff",
          2: "#b9b4cf",
          3: "#7f7a99",
        },
        accent: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
          muted: "#2b174d",
        },
        status: {
          ok: "#34d399",
          error: "#fb7185",
          warn: "#fbbf24",
        },
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "0.85rem" }],
      },
    },
  },
  plugins: [],
};
