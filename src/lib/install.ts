export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const LS_KEY = "flipflop:web:installDismissed";

export function isIOS(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua);
    const isIPadOS = /macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1;
    return isiOS || isIPadOS;
}

export function isStandalone(): boolean {
    return (
        (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
        (typeof (navigator as any).standalone !== "undefined" && (navigator as any).standalone)
    );
}

export function wasDismissed(): boolean {
    return localStorage.getItem(LS_KEY) === "1";
}

export function markDismissed(): void {
    localStorage.setItem(LS_KEY, "1");
}

export async function waitServiceWorkerReady(timeoutMs = 3000): Promise<boolean> {
    if (!("serviceWorker" in navigator)) return false;
    if (navigator.serviceWorker.controller) return true;
    return new Promise((resolve) => {
        const done = (v: boolean) => {
            resolve(v);
            navigator.serviceWorker.removeEventListener("controllerchange", onChange);
        };
        const onChange = () => done(true);
        navigator.serviceWorker.addEventListener("controllerchange", onChange);
        setTimeout(() => done(!!navigator.serviceWorker.controller), timeoutMs);
    });
}
