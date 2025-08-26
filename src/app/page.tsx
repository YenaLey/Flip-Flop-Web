"use client";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import TimerCard from "@/components/TimerCard";
import SettingsCard, { SettingsForm } from "@/components/SettingsCard";
import type { Settings, State, Phase, Log } from "@/types";
import { useBeep, useBgAudio } from "@/lib/audio";
import { loadLogs, saveLogs, loadSettings, saveSettings } from "@/lib/storage";

const norm = (v: string, min: number) => {
    const n = Math.floor(Number(v));
    return Number.isFinite(n) && n >= min ? n : min;
};

export default function Page() {
    const [settings, setSettings] = useState<Settings>({
        runSec: 60,
        restSec: 90,
        sets: 8,
        warmupSec: 10,
        volume: 0.2,
    });
    const [form, setForm] = useState<SettingsForm>({
        run: "60",
        rest: "90",
        sets: "8",
        warmup: "10",
        volume: 0.2,
    });
    const [state, setState] = useState<State>({
        phase: "warmup",
        setIndex: 1,
        left: 10,
        running: false,
    });
    const [logs, setLogs] = useState<Log[]>([]);

    const beep = useBeep(form.volume);
    const bg = useBgAudio();

    const tId = useRef<number | null>(null);
    const target = useRef(0);
    const prevSec = useRef<number | null>(null);
    const phaseRef = useRef<Phase>("warmup");
    const setIdxRef = useRef(1);
    const leftRef = useRef(10);
    const settingsRef = useRef(settings);

    useEffect(() => {
        setLogs(loadLogs());
    }, []);
    useEffect(() => {
        const s = loadSettings();
        if (s) {
            setSettings(s);
            settingsRef.current = s;
            setForm({
                run: String(s.runSec),
                rest: String(s.restSec),
                sets: String(s.sets),
                warmup: String(s.warmupSec),
                volume: s.volume,
            });
            setState((x) => ({ ...x, left: s.warmupSec }));
            leftRef.current = s.warmupSec;
        }
    }, []);
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    const tick = () => {
        const now = Date.now();
        if (now >= target.current) {
            nextPhase();
            return;
        }
        const left = Math.max(0, Math.floor((target.current - now) / 1000));
        if (left !== prevSec.current) {
            if (left > 0 && left <= 10) beep(900, 80);
            prevSec.current = left;
            leftRef.current = left;
            setState((s) => ({ ...s, left }));
        }
    };

    const applyForm = (): Settings => ({
        runSec: norm(form.run, 1),
        restSec: norm(form.rest, 1),
        sets: norm(form.sets, 1),
        warmupSec: norm(form.warmup, 0),
        volume: form.volume,
    });

    const start = async () => {
        if (tId.current) return;
        const s = applyForm();
        setSettings(s);
        settingsRef.current = s;
        saveSettings(s);
        phaseRef.current = "warmup";
        setIdxRef.current = 1;
        leftRef.current = s.warmupSec;
        prevSec.current = s.warmupSec;
        setState({ phase: "warmup", setIndex: 1, left: s.warmupSec, running: true });
        target.current = Date.now() + s.warmupSec * 1000;
        tId.current = window.setInterval(tick, 200);
        await bg.on("Async");
        await beep(660, 120);
    };

    const pause = () => {
        if (!tId.current) return;
        clearInterval(tId.current);
        tId.current = null;
        setState((s) => ({ ...s, running: false }));
    };

    const resume = () => {
        if (state.phase === "done" || tId.current) return;
        setState((s) => ({ ...s, running: true }));
        prevSec.current = leftRef.current;
        target.current = Date.now() + leftRef.current * 1000;
        tId.current = window.setInterval(tick, 200);
    };

    const reset = () => {
        if (tId.current) {
            clearInterval(tId.current);
            tId.current = null;
        }
        const s = settingsRef.current;
        phaseRef.current = "warmup";
        setIdxRef.current = 1;
        leftRef.current = s.warmupSec;
        prevSec.current = s.warmupSec;
        setState({ phase: "warmup", setIndex: 1, left: s.warmupSec, running: false });
        bg.off();
    };

    const nextPhase = () => {
        const s = settingsRef.current;
        if (phaseRef.current === "warmup") {
            phaseRef.current = "run";
            leftRef.current = s.runSec;
            prevSec.current = s.runSec;
            target.current = Date.now() + s.runSec * 1000;
            setState((v) => ({ ...v, phase: "run", left: s.runSec }));
            return;
        }
        if (phaseRef.current === "run") {
            if (setIdxRef.current >= s.sets) {
                if (tId.current) {
                    clearInterval(tId.current);
                    tId.current = null;
                }
                phaseRef.current = "done";
                leftRef.current = 0;
                setState((v) => ({ ...v, phase: "done", running: false, left: 0 }));
                bg.off();
                return;
            }
            phaseRef.current = "rest";
            leftRef.current = s.restSec;
            prevSec.current = s.restSec;
            target.current = Date.now() + s.restSec * 1000;
            setState((v) => ({ ...v, phase: "rest", left: s.restSec }));
            return;
        }
        if (phaseRef.current === "rest") {
            setIdxRef.current += 1;
            phaseRef.current = "run";
            leftRef.current = s.runSec;
            prevSec.current = s.runSec;
            target.current = Date.now() + s.runSec * 1000;
            setState((v) => ({ ...v, phase: "run", setIndex: setIdxRef.current, left: s.runSec }));
            return;
        }
    };

    const saveSimpleLog = () => {
        const s = settingsRef.current;
        const total = s.warmupSec + s.sets * (s.runSec + s.restSec) - s.restSec;
        const log: Log = {
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            totalSec: total,
            runSec: s.runSec,
            restSec: s.restSec,
            sets: s.sets,
            warmupSec: s.warmupSec,
        };
        const next = [log, ...logs];
        setLogs(next);
        saveLogs(next);
        alert("저장되었습니다.");
    };

    return (
        <main className="mx-auto max-w-sm px-4 pb-24 pt-6">
            <Header />
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
            <SettingsCard form={form} setForm={setForm} />
            {state.phase === "done" && (
                <div className="mt-4">
                    <button
                        onClick={saveSimpleLog}
                        className="w-full rounded-2xl py-3 bg-black text-white"
                    >
                        기록 저장
                    </button>
                </div>
            )}
        </main>
    );
}
