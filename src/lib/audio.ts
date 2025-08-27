import type { Segment } from "@/types";
import { makeTimelineWavUrl } from "./wav";

export type RenderResult = {
    url: string;
    segOffsets: number[];
    total: number;
};

export function renderTimeline(tl: Segment[], volume: number): RenderResult {
    let offset = 0;
    const segs = [];
    const segOffsets: number[] = [];
    for (const s of tl) {
        segs.push({ start: offset, len: s.secs, phase: s.phase });
        segOffsets.push(offset + s.secs);
        offset += s.secs;
    }
    const url = makeTimelineWavUrl(segs, volume);
    return { url, segOffsets, total: offset };
}
