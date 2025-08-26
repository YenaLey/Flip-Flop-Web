"use client";
import { fmtClock } from "@/lib/timer";
import type { Phase } from "@/types";

export default function TimerCard({
    phase,
    setIndex,
    sets,
    left,
    running,
    onStart,
    onPause,
    onResume,
    onReset,
}: {
    phase: Phase;
    setIndex: number;
    sets: number;
    left: number;
    running: boolean;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onReset: () => void;
}) {
    const canStart = !running && phase !== "done";
    return (
        <section className="rounded-3xl p-5 shadow-sm border border-neutral-100 bg-white">
            <div className="text-sm text-neutral-500">
                세트 {setIndex}/{sets} • {phase.toUpperCase()}
            </div>
            <div className="text-center text-6xl font-semibold my-3 tabular-nums">
                {fmtClock(Math.max(0, left))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                    onClick={onStart}
                    disabled={!canStart}
                    className="rounded-2xl py-3 bg-black text-white disabled:opacity-30"
                >
                    시작
                </button>
                <button
                    onClick={running ? onPause : onResume}
                    className="rounded-2xl py-3 border border-neutral-200"
                >
                    {running ? "일시정지" : "재시작"}
                </button>
                <button onClick={onReset} className="rounded-2xl py-3 border border-neutral-200">
                    리셋
                </button>
            </div>
        </section>
    );
}
