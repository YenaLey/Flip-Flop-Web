import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";

export const metadata: Metadata = { title: "Flip Flop", description: "Interval Running Timer" };
export const viewport: Viewport = { themeColor: "#222222" };

const ubuntu = Ubuntu({
    subsets: ["latin"],
    weight: ["300", "500", "700"],
    display: "swap",
    variable: "--font-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <head>
                <link rel="manifest" href="/manifest.webmanifest" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
                />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
            </head>
            <body className={`${ubuntu.variable} font-sans min-h-dvh bg-white`}>{children}</body>
        </html>
    );
}
