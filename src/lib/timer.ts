import type { Settings, Segment } from "@/types";

export function buildTimeline(s: Settings): Segment[] {
    const list: Segment[] = [];
    if (s.warmup > 0) list.push({ phase: "warmup", secs: s.warmup, setIndex: 0 });
    for (let i = 1; i <= s.sets; i++) {
        list.push({ phase: "run", secs: s.run, setIndex: i });
        if (i < s.sets) list.push({ phase: "rest", secs: s.rest, setIndex: i });
    }
    return list;
}

export function fmt(sec: number) {
    const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}
