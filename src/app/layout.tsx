import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: "Async",
    description: "Interval running timer",
};

export const viewport: Viewport = { themeColor: "#222222" };

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
            <body className="min-h-dvh bg-white text-brand">{children}</body>
        </html>
    );
}
