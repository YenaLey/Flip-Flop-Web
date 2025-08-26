"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import TimerCard from "@/components/TimerCard";
import SettingsCard from "@/components/SettingsCard";
import RecordsSection from "@/components/RecordsSection";
import IOSInstallSheet from "@/components/IOSInstallSheet";
import { useAudio } from "@/lib/audio";
import { composePhoto } from "@/lib/photo";
import { createTicker, fmtClock } from "@/lib/timer";
import { loadLogs, saveLogs } from "@/lib/storage";
import { Log, Phase, Settings, State } from "@/types";

export default function Page() {
    const [settings, setSettings] = useState<Settings>({
        runSec: 60,
        restSec: 90,
        sets: 8,
        warmupSec: 10,
        volume: 0.2,
    });
    const [state, setState] = useState<State>({
        phase: "warmup",
        setIndex: 1,
        left: 10,
        running: false,
    });
    const [logs, setLogs] = useState<Log[]>([]);
    const [distance, setDistance] = useState("");
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [showIOS, setShowIOS] = useState(false);
    const { beep, bgStart, bgStop } = useAudio(settings.volume);
    const workerRef = useRef<Worker | null>(null);
    const untilRef = useRef<number>(0);

    useEffect(() => {
        setLogs(loadLogs());
    }, []);

    const updateMedia = (title: string, position: number, duration: number) => {
        try {
            if ("mediaSession" in navigator) {
                (navigator as any).mediaSession.metadata = new (window as any).MediaMetadata({
                    title: `Async • ${title}`,
                    artist: "Interval",
                });
                (navigator as any).mediaSession.setPositionState?.({
                    position,
                    duration,
                    playbackRate: state.running ? 1 : 0,
                });
            }
        } catch {}
    };

    const totalRemain = (phase: Phase, setIdx: number) => {
        const curLeft =
            phase === "warmup"
                ? settings.warmupSec
                : phase === "run"
                ? settings.runSec
                : settings.restSec;
        let remain = curLeft;
        let p = phase;
        for (let s = setIdx; s <= settings.sets; s++) {
            if (p === "warmup") {
                remain += settings.runSec + settings.restSec;
                p = "run";
            } else if (p === "run") {
                remain += settings.restSec;
                p = "rest";
            } else if (p === "rest") {
                remain += s < settings.sets ? settings.runSec : 0;
                p = s < settings.sets ? "run" : "done";
            }
        }
        return remain;
    };

    const onTick = async (now: number) => {
        if (!state.running) return;
        const leftMs = Math.max(0, untilRef.current - now);
        const left = Math.ceil(leftMs / 1000);
        if (left <= 10 && left > 0) beep(left === 1 ? 1200 : 900, 90);
        const phaseDur =
            state.phase === "warmup"
                ? settings.warmupSec
                : state.phase === "run"
                ? settings.runSec
                : settings.restSec;
        const elapsedInPhase = Math.min(phaseDur, phaseDur - left + 1);
        updateMedia(
            `${state.phase.toUpperCase()} ${state.setIndex}/${settings.sets}`,
            elapsedInPhase,
            phaseDur
        );
        setState((prev) => ({ ...prev, left }));
        if (left === 0) {
            await beep(520, 220);
            advance();
        }
    };

    const start = async () => {
        setState((s) => ({ ...s, phase: "warmup", left: settings.warmupSec, running: true }));
        await bgStart();
        workerRef.current?.postMessage("stop");
        const w = createTicker(onTick);
        workerRef.current = w;
        w.postMessage("start");
        const now = performance.now();
        untilRef.current = now + settings.warmupSec * 1000;
        await beep(660, 120);
    };

    const pause = () => {
        setState((s) => ({ ...s, running: false }));
        workerRef.current?.postMessage("stop");
    };
    const resume = () => {
        if (state.phase === "done") return;
        setState((s) => ({ ...s, running: true }));
        const now = performance.now();
        untilRef.current = now + state.left * 1000;
        workerRef.current?.postMessage("start");
    };
    const reset = () => {
        workerRef.current?.postMessage("stop");
        setState({ phase: "warmup", setIndex: 1, left: settings.warmupSec, running: false });
        bgStop();
    };

    const advance = () => {
        setState((prev) => {
            if (prev.phase === "warmup") {
                untilRef.current = performance.now() + settings.runSec * 1000;
                return { ...prev, phase: "run", left: settings.runSec };
            }
            if (prev.phase === "run") {
                untilRef.current = performance.now() + settings.restSec * 1000;
                return { ...prev, phase: "rest", left: settings.restSec };
            }
            if (prev.phase === "rest") {
                if (prev.setIndex < settings.sets) {
                    untilRef.current = performance.now() + settings.runSec * 1000;
                    return {
                        ...prev,
                        phase: "run",
                        setIndex: prev.setIndex + 1,
                        left: settings.runSec,
                    };
                }
                workerRef.current?.postMessage("stop");
                bgStop();
                return { ...prev, phase: "done", running: false, left: 0 };
            }
            return prev;
        });
    };

    const saveLog = () => {
        const elapsed =
            settings.warmupSec +
            settings.sets * (settings.runSec + settings.restSec) -
            settings.restSec;
        const dist = parseFloat(distance || "0");
        const pace = dist > 0 ? elapsed / 60 / dist : 0;
        const log: Log = {
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            distanceKm: Number.isFinite(dist) ? dist : 0,
            paceMinPerKm: pace,
            elapsedSec: elapsed,
            runSec: settings.runSec,
            restSec: settings.restSec,
            sets: settings.sets,
        };
        const next = [log, ...logs];
        setLogs(next);
        saveLogs(next);
    };

    const onPhoto = (file: File) => {
        const url = URL.createObjectURL(file);
        setPhotoURL(url);
    };
    const onCompose = async () => {
        if (!photoURL) return;
        const data = await composePhoto(photoURL, settings, distance);
        const a = document.createElement("a");
        a.href = data;
        a.download = `async_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.jpg`;
        a.click();
    };

    const estimate =
        settings.warmupSec +
        settings.sets * (settings.runSec + settings.restSec) -
        settings.restSec;

    return (
        <main className="mx-auto max-w-sm px-4 pb-24 pt-6">
            <Header onIOS={() => setShowIOS(true)} />
            <TimerCard
                phase={state.phase}
                setIndex={state.setIndex}
                sets={settings.sets}
                left={state.left}
                running={state.running}
                onStart={start}
                onPause={pause}
                onResume={resume}
                onReset={reset}
            />
            <SettingsCard
                settings={settings}
                setSettings={setSettings}
                onBgOn={bgStart}
                onBgOff={bgStop}
            />
            <RecordsSection
                distance={distance}
                setDistance={setDistance}
                estimate={estimate}
                onSave={saveLog}
                onPhoto={onPhoto}
                onCompose={onCompose}
                photoURL={photoURL}
                logs={logs}
            />
            <IOSInstallSheet open={showIOS} onClose={() => setShowIOS(false)} />
        </main>
    );
}
