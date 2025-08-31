import type { RefObject } from "react";

export type TWorkoutPhase = "warmup" | "work" | "rest" | "cooldown" | "finished";

export type TTimerStatus = "idle" | "running" | "paused" | "completed";

export type TSetting = {
    warmup: number;
    work: number;
    rest: number;
    sets: number;
    cooldown: number;
    volume: number;
};

export type TTimelineSegment = {
    phase: Exclude<TWorkoutPhase, "finished">;
    duration: number;
    setIndex: number;
};

export interface IInstallPopupEvent extends Event {
    popup: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type TTimerContext = {
    setSetting: (setting: TSetting) => void;
    setWorkoutPhase: (workoutPhase: TWorkoutPhase) => void;
    setSetIndex: (setIndex: number) => void;
    setTimeLeft: (timeLeft: number) => void;
    setTimerStatus: (timerStatus: TTimerStatus) => void;
    setTickPercents: (ticks: number[]) => void;
    settingRef: RefObject<TSetting>;
    timerStatusRef: RefObject<TTimerStatus>;
    timelineRef: RefObject<TTimelineSegment[]>;
    timelineEndsRef: RefObject<number[]>;
    totalDurationRef: RefObject<number>;
    timeLeftRef: RefObject<number | null>;
    rafRef: RefObject<number | null>;
    audioRef: RefObject<HTMLAudioElement | null>;
    barRef: RefObject<HTMLDivElement | null>;
};
