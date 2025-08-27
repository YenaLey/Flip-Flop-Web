export type Phase = "warmup" | "run" | "rest" | "done";

export type Settings = {
    warmup: number;
    run: number;
    rest: number;
    sets: number;
    volume: number;
};

export type Segment = { phase: Exclude<Phase, "done">; secs: number; setIndex: number };
