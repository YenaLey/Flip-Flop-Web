import "./globals.css";
import type { Metadata, Viewport } from "next";
import RegisterSW from "./register-sw";
import IOSSplashLinks from "./ios-splash-links";

export const metadata: Metadata = {
    title: "Flip Flop",
    description: "Interval Running Timer",
};
export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
                />
                <meta name="theme-color" content="#ffffff" />

                <link rel="manifest" href="/manifest.webmanifest" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />

                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Flip Flop" />

                <IOSSplashLinks />
            </head>
            <body className="font-sans h-screen bg-white">
                <RegisterSW />
                {children}
            </body>
        </html>
    );
}
