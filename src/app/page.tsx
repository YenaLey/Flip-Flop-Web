"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
    TWorkoutPhase,
    TTimerStatus,
    TSetting,
    TTimelineSegment,
    IInstallPopupEvent,
    TTimerContext,
} from "@/types";
import SettingRow from "@/components/SettingRow";
import InstallPopup from "@/components/InstallPopup";
import { isIOS, isPWA, getInstallPopupHidden, setInstallPopupHidden } from "@/utils/pwa";
import {
    start,
    pause,
    resume,
    reset,
    updateSetting,
    updateFromCurrentTime,
    formatTime,
} from "@/utils/controls";

export default function Page() {
    const [setting, setSetting] = useState<TSetting>({
        warmup: 120,
        work: 60,
        rest: 90,
        sets: 8,
        cooldown: 120,
        volume: 0.2,
    });
    const [phase, setWorkoutPhase] = useState<TWorkoutPhase>("warmup");
    const [setIndex, setSetIndex] = useState(1);
    const [timeLeft, setTimeLeft] = useState(setting.warmup);
    const [status, setTimerStatus] = useState<TTimerStatus>("idle");

    const [showInstall, setShowInstall] = useState(true);
    const [ios, setIos] = useState(false);
    const [installed, setInstalled] = useState(false);
    const installEventRef = useRef<IInstallPopupEvent | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timelineRef = useRef<TTimelineSegment[]>([]);
    const timelineEndsRef = useRef<number[]>([]);
    const timeLeftRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const barRef = useRef<HTMLDivElement | null>(null);
    const totalDurationRef = useRef<number>(0);
    const [tickPercents, setTickPercents] = useState<number[]>([]);

    const settingRef = useRef(setting);
    useEffect(() => {
        settingRef.current = setting;
    }, [setting]);

    const timerStatusRef = useRef<TTimerStatus>(status);
    useEffect(() => {
        timerStatusRef.current = status;
    }, [status]);

    const timerContext: TTimerContext = useMemo(
        () => ({
            setSetting,
            setWorkoutPhase,
            setSetIndex,
            setTimeLeft,
            setTimerStatus,
            setTickPercents,

            settingRef,
            timerStatusRef,
            audioRef,
            timelineRef,
            timelineEndsRef,
            timeLeftRef,
            rafRef,
            totalDurationRef,
            barRef,
        }),
        []
    );

    useEffect(() => {
        const raw = localStorage.getItem("flipflop:setting");
        if (raw) {
            const saved = JSON.parse(raw) as TSetting;
            setSetting(saved);
            setTimeLeft(saved.warmup ?? 10);
        }
    }, []);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = setting.volume;
    }, [setting.volume]);

    useEffect(() => {
        const hidden = getInstallPopupHidden();
        setIos(isIOS());
        setInstalled(isPWA());

        const mm = window.matchMedia("(display-mode: standalone)");
        const onDM = () => setInstalled(mm.matches);
        mm.addEventListener?.("change", onDM);

        const onBeforeInstallPrompt = (e: Event) => {
            const ev = e as IInstallPopupEvent;
            ev.preventDefault();
            installEventRef.current = ev;
            if (!hidden && !isPWA()) setShowInstall(true);
        };
        const onInstalled = () => {
            setInstalled(true);
            setShowInstall(false);
            setInstallPopupHidden();
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onInstalled);

        if (isIOS() && !hidden && !isPWA()) setShowInstall(true);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
            window.removeEventListener("appinstalled", onInstalled);
            mm.removeEventListener?.("change", onDM);
        };
    }, []);

    const askInstall = async () => {
        const ev = installEventRef.current;
        if (!ev) return;
        await ev.popup();
        try {
            const res = await ev.userChoice;
            if (res.outcome !== "accepted") setInstallPopupHidden();
        } finally {
            installEventRef.current = null;
            setShowInstall(false);
        }
    };

    const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const a = audioRef.current;
        const total = totalDurationRef.current;
        if (!a || !total) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = Math.min(1, Math.max(0, x / rect.width));
        a.currentTime = ratio * total;
        updateFromCurrentTime(timerContext, a.currentTime);
    };

    return (
        <div className="h-screen max-w-[500px] m-auto flex flex-col justify-between p-5">
            <div className="flex justify-start items-center gap-4">
                <img src="/icons/icon-light.png" alt="logo" className="w-10 h-10" />
                <h1 className="text-2xl font-bold tracking-tight">Flip Flop</h1>
            </div>

            <div className="rounded-3xl border border-neutral-200 p-6">
                <div className="text-neutral-500">Phase</div>
                <div className="mt-1 text-4xl font-bold tracking-tight">{phase.toUpperCase()}</div>
                <div className="mt-4 flex flex-row justify-between">
                    <div>
                        <div className="text-neutral-500">Set</div>
                        <div className="text-2xl font-semibold">
                            {phase === "work" ? `${setIndex}/${setting.sets}` : "-"}
                        </div>
                    </div>
                    <div className="items-end text-right">
                        <div className="text-neutral-500">Left</div>
                        <div className="mt-1 text-5xl font-medium tracking-tight">
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {status === "idle" && (
                    <div className="mt-6">
                        <button
                            onClick={() => start(timerContext)}
                            className="w-full rounded-2xl bg-black py-3 text-white font-semibold"
                        >
                            Start
                        </button>
                    </div>
                )}

                {status === "running" && (
                    <div className="mt-6 flex flex-row gap-3">
                        <button
                            onClick={() => pause(timerContext)}
                            className="flex-1 rounded-2xl border border-neutral-300 py-3 font-semibold"
                        >
                            Pause
                        </button>
                        <button
                            onClick={() => reset(timerContext)}
                            className="flex-1 rounded-2xl border border-neutral-300 py-3 font-semibold"
                        >
                            Reset
                        </button>
                    </div>
                )}

                {status === "paused" && (
                    <div className="mt-6 flex flex-row gap-3">
                        <button
                            onClick={() => resume(timerContext)}
                            className="flex-1 rounded-2xl bg-black py-3 text-white font-semibold"
                        >
                            Resume
                        </button>
                        <button
                            onClick={() => reset(timerContext)}
                            className="flex-1 rounded-2xl border border-neutral-300 py-3 font-semibold"
                        >
                            Reset
                        </button>
                    </div>
                )}

                {status === "completed" && (
                    <div className="mt-6">
                        <button
                            onClick={() => reset(timerContext)}
                            className="w-full rounded-2xl border border-neutral-300 py-3 font-semibold"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            <div
                onClick={onBarClick}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Timer progress"
            >
                <div className="relative h-2 rounded-full bg-neutral-200 overflow-hidden">
                    <div
                        ref={barRef}
                        className="absolute left-0 top-0 h-full bg-black"
                        style={{ width: "0%" }}
                    />
                    {tickPercents.map((p, i) => (
                        <div
                            key={i}
                            className="absolute top-0 h-full w-px bg-white/60"
                            style={{ left: `calc(${p}% - 0.5px)` }}
                        />
                    ))}
                </div>
                <div className="mt-1 flex justify-between text-xs text-neutral-500">
                    <span>00:00</span>
                    <span>{formatTime(Math.round(totalDurationRef.current || 0))}</span>
                </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 p-6">
                <SettingRow
                    label="Warmup"
                    value={setting.warmup}
                    onDecrease={() => updateSetting(timerContext, "warmup", -5)}
                    onIncrease={() => updateSetting(timerContext, "warmup", +5)}
                />
                <SettingRow
                    label="Work"
                    value={setting.work}
                    onDecrease={() => updateSetting(timerContext, "work", -5)}
                    onIncrease={() => updateSetting(timerContext, "work", +5)}
                />
                <SettingRow
                    label="Rest"
                    value={setting.rest}
                    onDecrease={() => updateSetting(timerContext, "rest", -5)}
                    onIncrease={() => updateSetting(timerContext, "rest", +5)}
                />
                <SettingRow
                    label="Sets"
                    value={setting.sets}
                    onDecrease={() => updateSetting(timerContext, "sets", -1)}
                    onIncrease={() => updateSetting(timerContext, "sets", +1)}
                />
                <SettingRow
                    label="Cooldown"
                    value={setting.cooldown}
                    onDecrease={() => updateSetting(timerContext, "cooldown", -5)}
                    onIncrease={() => updateSetting(timerContext, "cooldown", +5)}
                />
                <div className="mt-5">
                    <div className="mb-2 text-sm text-neutral-600">Beep Volume</div>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={setting.volume}
                        onChange={(e) =>
                            setSetting((c) => ({
                                ...c,
                                volume: Number((e.target as HTMLInputElement).value),
                            }))
                        }
                        className="w-full"
                    />
                    <div className="mt-1 text-right text-xs text-neutral-500">
                        {Math.round(setting.volume * 100)}%
                    </div>
                </div>
            </div>

            {showInstall && (
                <InstallPopup
                    isIOS={ios}
                    isInstalled={installed}
                    onInstall={askInstall}
                    onDismiss={() => {
                        setShowInstall(false);
                        setInstallPopupHidden();
                    }}
                />
            )}
        </div>
    );
}
