"use client";

import { useEffect, useRef, useState } from "react";

export default function Header({ onIOS }: { onIOS: () => void }) {
    const [installable, setInstallable] = useState(false);
    const deferred = useRef<any>(null);

    useEffect(() => {
        const onBIP = (e: any) => {
            e.preventDefault();
            deferred.current = e;
            setInstallable(true);
        };
        window.addEventListener("beforeinstallprompt", onBIP);
        return () => window.removeEventListener("beforeinstallprompt", onBIP);
    }, []);

    const install = async () => {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        if (isIOS) {
            onIOS();
            return;
        }
        if (deferred.current) {
            deferred.current.prompt();
            await deferred.current.userChoice;
            setInstallable(false);
            deferred.current = null;
        }
    };

    return (
        <header className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold tracking-tight">Async</div>
            <button
                onClick={install}
                className="rounded-2xl px-3 py-2 text-sm border border-neutral-200 shadow-sm"
            >
                홈화면 설치
            </button>
        </header>
    );
}
