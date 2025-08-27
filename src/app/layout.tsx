import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import RegisterSW from "./register-sw";

export const metadata: Metadata = { title: "Flip Flop", description: "Interval Running Timer" };
export const viewport: Viewport = { themeColor: "#222222" };

const ubuntu = Ubuntu({
    subsets: ["latin"],
    weight: ["300", "500", "700"],
    display: "swap",
    variable: "--font-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    if (typeof window !== "undefined") {
        const setScreenSize = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };
        setScreenSize();
        window.addEventListener("resize", setScreenSize);
    }

    return (
        <html lang="ko">
            <head>
                <link rel="manifest" href="/manifest.webmanifest" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Flip Flop" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
                />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
            </head>
            <body className={`${ubuntu.variable} font-sans h-screen bg-white`}>
                <RegisterSW />
                {children}
            </body>
        </html>
    );
}
