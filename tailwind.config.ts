import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: { brand: "#222", accent: "#4ade80" },
            fontFamily: {
                sans: ['"Samsung Sharp Sans"', "Arial"],
            },
        },
    },
    plugins: [],
} satisfies Config;
