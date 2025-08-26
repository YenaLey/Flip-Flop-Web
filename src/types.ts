export type Phase = "warmup" | "run" | "rest" | "done";

export interface Settings {
    runSec: number;
    restSec: number;
    sets: number;
    warmupSec: number;
    volume: number;
}

export interface State {
    phase: Phase;
    setIndex: number;
    left: number;
    running: boolean;
}

export interface Log {
    id: string;
    at: string;
    distanceKm: number;
    paceMinPerKm: number;
    elapsedSec: number;
    runSec: number;
    restSec: number;
    sets: number;
}
