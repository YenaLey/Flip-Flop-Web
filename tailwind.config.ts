import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: { brand: "#222", accent: "#4ade80" },
            fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
            height: {
                screen: "calc(var(--vh, 1vh) * 100)",
            },
        },
    },
    plugins: [],
} satisfies Config;
