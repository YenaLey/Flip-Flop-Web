"use client";

import { useState } from "react";
import { setInstallPopupHidden } from "@/utils/pwa";

export default function InstallPopup({
    isIOS,
    isInstalled,
    onInstall,
    onDismiss,
}: {
    isIOS: boolean;
    isInstalled: boolean;
    onInstall?: () => Promise<void> | void;
    onDismiss: () => void;
}) {
    if (isInstalled) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl">
                <div className="text-lg font-bold leading-6">앱으로 더 간편하게</div>
                <div className="mt-1 text-sm text-neutral-600">
                    홈 화면에 추가해 바로 실행하세요
                </div>
                {isIOS ? (
                    <IOSCard onDismiss={onDismiss} />
                ) : (
                    <AndroidCard onInstall={onInstall} onDismiss={onDismiss} />
                )}
            </div>
        </div>
    );
}

function AndroidCard({
    onInstall,
    onDismiss,
}: {
    onInstall?: () => Promise<void> | void;
    onDismiss: () => void;
}) {
    const [busy, setBusy] = useState(false);

    const clickInstall = async () => {
        if (!onInstall) return;
        setBusy(true);
        try {
            await onInstall();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mt-5">
            <button
                onClick={clickInstall}
                disabled={!onInstall || busy}
                className={`w-full rounded-2xl py-3 font-semibold ${
                    onInstall ? "bg-black text-white" : "bg-neutral-200 text-neutral-500"
                }`}
            >
                {onInstall ? "앱 설치" : "설치 메뉴에서 진행"}
            </button>
            <button
                onClick={onDismiss}
                className="mt-3 w-full rounded-2xl border border-neutral-300 py-3 font-semibold"
            >
                웹으로 계속 이용
            </button>
            {!onInstall && (
                <div className="mt-2 text-center text-xs text-neutral-500">
                    브라우저 메뉴의 “홈 화면에 추가”를 선택하세요
                </div>
            )}
        </div>
    );
}

function IOSCard({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="mt-4">
            <ol className="list-decimal pl-5 text-sm text-neutral-700 space-y-1">
                <li>공유 버튼을 선택</li>
                <li>“홈 화면에 추가”를 누르면 앱이 설치됩니다</li>
            </ol>
            <button
                onClick={() => {
                    setInstallPopupHidden();
                    onDismiss();
                }}
                className="mt-4 w-full rounded-2xl border border-neutral-300 py-3 font-semibold"
            >
                웹으로 계속 이용
            </button>
        </div>
    );
}
