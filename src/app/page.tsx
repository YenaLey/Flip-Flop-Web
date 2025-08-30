"use client";

import { useEffect, useRef, useState } from "react";
import Row from "@/components/Row";
import type { Phase, Settings, Segment } from "@/types";
import { buildTimeline, fmt } from "@/lib/timer";
import { renderTimeline } from "@/lib/audio";
import InstallPopup from "@/components/InstallPopup";
import {
    isIOS,
    isStandalone,
    wasDismissed,
    markDismissed,
    type BeforeInstallPromptEvent,
} from "@/lib/install";
import { FaLock, FaLockOpen } from "react-icons/fa";

type Status = "idle" | "running" | "paused" | "done";

export default function Page() {
    const [cfg, setCfg] = useState<Settings>({
        warmup: 10,
        run: 60,
        rest: 90,
        sets: 8,
        volume: 0.2,
    });
    const [phase, setPhase] = useState<Phase>("warmup");
    const [setIdx, setSetIdx] = useState(1);
    const [left, setLeft] = useState(cfg.warmup);
    const [status, setStatus] = useState<Status>("idle");
    const [locked, setLocked] = useState(false);

    const [showInstall, setShowInstall] = useState(true);
    const [ios, setIos] = useState(false);
    const [installed, setInstalled] = useState(false);
    const evRef = useRef<BeforeInstallPromptEvent | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timelineRef = useRef<Segment[]>([]);
    const segEndsRef = useRef<number[]>([]);
    const lastSecRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const unlockClicksRef = useRef(0);
    const unlockTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const s = localStorage.getItem("flipflop:web:settings");
        if (s) {
            const v = JSON.parse(s) as Settings;
            setCfg(v);
            setLeft(v.warmup ?? 10);
        }
    }, []);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = cfg.volume;
    }, [cfg.volume]);

    useEffect(() => {
        const dismissed = wasDismissed();
        const isiOS = isIOS();
        setIos(isiOS);
        const standalone = isStandalone();
        setInstalled(standalone);

        const mm = window.matchMedia("(display-mode: standalone)");
        const onDM = () => setInstalled(mm.matches);
        mm.addEventListener?.("change", onDM);

        const onBIP = (e: Event) => {
            const ev = e as BeforeInstallPromptEvent;
            ev.preventDefault();
            evRef.current = ev;
            if (!dismissed && !standalone) setShowInstall(true);
        };
        const onInstalled = () => {
            setInstalled(true);
            setShowInstall(false);
            markDismissed();
        };

        window.addEventListener("beforeinstallprompt", onBIP);
        window.addEventListener("appinstalled", onInstalled);

        if (isiOS && !dismissed && !standalone) setShowInstall(true);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBIP);
            window.removeEventListener("appinstalled", onInstalled);
            mm.removeEventListener?.("change", onDM);
        };
    }, []);

    const triggerInstall = async () => {
        const ev = evRef.current;
        if (!ev) return;
        await ev.prompt();
        try {
            const res = await ev.userChoice;
            if (res.outcome !== "accepted") markDismissed();
        } finally {
            evRef.current = null;
            setShowInstall(false);
        }
    };

    const applyFromTime = (t: number) => {
        const ends = segEndsRef.current;
        let idx = ends.findIndex((x) => t < x);
        if (idx === -1) idx = ends.length - 1;
        const startOfSeg = idx === 0 ? 0 : ends[idx - 1];
        const seg = timelineRef.current[idx];
        if (!seg) {
            stop();
            setStatus("done");
            setPhase("done");
            setLeft(0);
            return;
        }
        if (seg.phase !== phase) setPhase(seg.phase);
        if (seg.phase === "warmup") setSetIdx(1);
        else setSetIdx(seg.setIndex || 1);
        const remain = Math.max(0, Math.ceil(seg.secs - (t - startOfSeg)));
        if (remain !== lastSecRef.current) {
            lastSecRef.current = remain;
            setLeft(remain);
        }
    };

    const loop = () => {
        if (!audioRef.current) return;
        applyFromTime(audioRef.current.currentTime);
        rafRef.current = requestAnimationFrame(loop);
    };

    const start = () => {
        localStorage.setItem("flipflop:web:settings", JSON.stringify(cfg));
        const tl = buildTimeline(cfg);
        timelineRef.current = tl;
        const { url, segOffsets } = renderTimeline(tl, cfg.volume);
        segEndsRef.current = segOffsets;
        if (audioRef.current) URL.revokeObjectURL(audioRef.current.src);
        const a = new Audio(url);
        a.preload = "auto";
        a.controls = false;
        a.loop = false;
        a.volume = cfg.volume;
        a.onended = () => {
            cancel();
            setStatus("done");
            setPhase("done");
            setLeft(0);
        };
        audioRef.current = a;
        setStatus("running");
        applyFromTime(0);
        a.play();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(loop);
    };

    const pause = () => {
        if (status !== "running") return;
        audioRef.current?.pause();
        setStatus("paused");
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    const resume = () => {
        if (status !== "paused") return;
        audioRef.current?.play();
        setStatus("running");
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(loop);
    };

    const cancel = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        if (audioRef.current) {
            try {
                audioRef.current.pause();
            } catch {}
        }
    };

    const reset = () => {
        cancel();
        setStatus("idle");
        setPhase("warmup");
        setSetIdx(1);
        setLeft(cfg.warmup);
        lastSecRef.current = null;
    };

    const stop = () => {
        cancel();
        setStatus("done");
    };

    const step = (k: keyof Settings, d: number) => {
        setCfg((c) => {
            const v = Math.max(0, (c[k] as number) + d);
            const n = { ...c, [k]: v };
            if (k === "warmup" && status === "idle") setLeft(v);
            return n;
        });
    };

    const onLockClick = () => {
        if (!locked) {
            setLocked(true);
            return;
        }
        unlockClicksRef.current += 1;
        if (unlockClicksRef.current === 1) {
            unlockTimerRef.current = window.setTimeout(() => {
                unlockClicksRef.current = 0;
                unlockTimerRef.current && clearTimeout(unlockTimerRef.current);
                unlockTimerRef.current = null;
            }, 450);
        } else if (unlockClicksRef.current >= 2) {
            unlockClicksRef.current = 0;
            if (unlockTimerRef.current) {
                clearTimeout(unlockTimerRef.current);
                unlockTimerRef.current = null;
            }
            setLocked(false);
        }
    };

    return (
        <div className="h-screen max-w-[500px] m-auto">
            <div className="px-5 pt-4 flex justify-start items-center gap-4">
                <img src="/icons/icon-light.png" alt="logo" className="w-10 h-10" />
                <h1 className="text-2xl font-bold tracking-tight">Flip Flop</h1>
            </div>

            <div className="mx-5 mt-6 rounded-3xl border border-neutral-200 p-6">
                <div className="text-neutral-500">Phase</div>
                <div className="mt-1 text-4xl font-bold tracking-tight">{phase.toUpperCase()}</div>
                <div className="mt-4 flex flex-row justify-between">
                    <div>
                        <div className="text-neutral-500">Set</div>
                        <div className="text-2xl font-semibold">
                            {phase === "warmup" ? "-" : `${setIdx}/${cfg.sets}`}
                        </div>
                    </div>
                    <div className="items-end text-right">
                        <div className="text-neutral-500">Left</div>
                        <div className="mt-1 text-5xl font-medium tracking-tight">{fmt(left)}</div>
                    </div>
                </div>

                {status === "idle" && (
                    <div className="mt-6">
                        <button
                            onClick={start}
                            className="w-full rounded-2xl bg-black py-3 text-white font-semibold"
                        >
                            Start
                        </button>
                    </div>
                )}

                {status === "running" && (
                    <div className="mt-6 flex flex-row gap-3">
                        <button
                            onClick={pause}
                            className="flex-1 rounded-2xl border border-neutral-300 py-3 font-semibold"
                        >
                            Stop
                        </button>
                        <button
                            onClick={reset}
                            className="flex-1 rounded-2xl border border-neutral-300 py-3 font-semibold"
                        >
                            Reset
                        </button>
                    </div>
                )}

                {status === "paused" && (
                    <div className="mt-6 flex flex-row gap-3">
                        <button
                            onClick={resume}
                            className="flex-1 rounded-2xl bg-black py-3 text-white font-semibold"
                        >
                            Restart
                        </button>
                        <button
                            onClick={reset}
                            className="flex-1 rounded-2xl border border-neutral-300 py-3 font-semibold"
                        >
                            Reset
                        </button>
                    </div>
                )}

                {status === "done" && (
                    <div className="mt-6">
                        <button
                            onClick={reset}
                            className="w-full rounded-2xl border border-neutral-300 py-3 font-semibold"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            <div className="mx-5 mt-6 rounded-3xl border border-neutral-200 p-6">
                <Row
                    label="Warmup"
                    value={cfg.warmup}
                    dec={() => step("warmup", -5)}
                    inc={() => step("warmup", +5)}
                />
                <Row
                    label="Run"
                    value={cfg.run}
                    dec={() => step("run", -5)}
                    inc={() => step("run", +5)}
                />
                <Row
                    label="Rest"
                    value={cfg.rest}
                    dec={() => step("rest", -5)}
                    inc={() => step("rest", +5)}
                />
                <Row
                    label="Sets"
                    value={cfg.sets}
                    dec={() => step("sets", -1)}
                    inc={() => step("sets", +1)}
                />
                <div className="mt-5">
                    <div className="mb-2 text-sm text-neutral-600">Beep Volume</div>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={cfg.volume}
                        onChange={(e) =>
                            setCfg((c) => ({
                                ...c,
                                volume: Number((e.target as HTMLInputElement).value),
                            }))
                        }
                        className="w-full"
                    />
                    <div className="mt-1 text-right text-xs text-neutral-500">
                        {Math.round(cfg.volume * 100)}%
                    </div>
                </div>
            </div>

            <button
                onClick={onLockClick}
                className={`fixed right-4 top-4 z-50 h-10 w-10 rounded-full border shadow flex items-center justify-center ${
                    locked
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-neutral-300"
                }`}
                aria-pressed={locked}
                aria-label={locked ? "Unlock (double tap)" : "Lock"}
            >
                {locked ? <FaLock className="h-5 w-5" /> : <FaLockOpen className="h-5 w-5" />}
            </button>
            {locked && <div className="fixed inset-0 z-40 bg-transparent" />}

            {showInstall && (
                <InstallPopup
                    isIOS={ios}
                    isInstalled={installed}
                    onInstall={triggerInstall}
                    onDismiss={() => {
                        setShowInstall(false);
                        markDismissed();
                    }}
                />
            )}
        </div>
    );
}
