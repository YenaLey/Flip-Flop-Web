import type { RefObject } from "react";
import type { TSetting, TTimerContext } from "@/types";
import { createTimeline, createAudio } from "@/utils/timeline";

const updateBar = (barRef: RefObject<HTMLDivElement | null>, percent: number) => {
    if (barRef.current) barRef.current.style.width = `${percent}%`;
};

export const updateFromCurrentTime = (timerContext: TTimerContext, currentTime: number) => {
    const {
        timelineEndsRef,
        timelineRef,
        setWorkoutPhase,
        setSetIndex,
        setTimeLeft,
        timeLeftRef,
        totalDurationRef,
        barRef,
    } = timerContext;

    const ends = timelineEndsRef.current || [];
    let segmentIndex = ends.findIndex((endTime) => currentTime < endTime);
    if (segmentIndex === -1) segmentIndex = Math.max(0, ends.length - 1);

    const segmentStartTime = segmentIndex === 0 ? 0 : ends[segmentIndex - 1];
    const segment = (timelineRef.current || [])[segmentIndex];
    if (!segment) return;

    if (segment.phase !== undefined) setWorkoutPhase(segment.phase);
    setSetIndex(segment.setIndex ?? 0);

    const remaining = Math.max(0, Math.ceil(segment.duration - (currentTime - segmentStartTime)));
    if (remaining !== timeLeftRef.current) {
        timeLeftRef.current = remaining;
        setTimeLeft(remaining);
    }

    const total = totalDurationRef.current || 0;
    if (total > 0) updateBar(barRef, Math.min(100, Math.max(0, (currentTime / total) * 100)));
};

const animationLoop = (timerContext: TTimerContext) => {
    const { audioRef, rafRef } = timerContext;
    const audio = audioRef.current;
    if (!audio) return;

    updateFromCurrentTime(timerContext, audio.currentTime);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => animationLoop(timerContext));
};

export const start = (timerContext: TTimerContext) => {
    const {
        setSetting,
        settingRef,
        timelineRef,
        timelineEndsRef,
        totalDurationRef,
        setTickPercents,
        audioRef,
        setTimerStatus,
        setWorkoutPhase,
        setTimeLeft,
        rafRef,
        barRef,
    } = timerContext;

    const setting = settingRef.current!;
    localStorage.setItem("flipflop:setting", JSON.stringify(setting));
    setSetting(setting);

    const { timeline, timelineEnds, totalDuration } = createTimeline(setting);
    timelineRef.current = timeline;

    const audioUrl = createAudio(timeline, totalDuration, setting.volume);
    timelineEndsRef.current = timelineEnds;
    totalDurationRef.current = totalDuration;
    setTickPercents(timelineEnds.map((t) => (t / totalDuration) * 100));

    if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);

    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.controls = false;
    audio.loop = false;
    audio.volume = setting.volume;
    audio.onended = () => {
        updateBar(barRef, 100);
        setTimerStatus("completed");
        setWorkoutPhase("finished");
        setTimeLeft(0);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        try {
            audioRef.current?.pause();
        } catch {}
    };
    audioRef.current = audio;

    updateBar(barRef, 0);
    setTimerStatus("running");
    updateFromCurrentTime(timerContext, 0);
    void audio.play();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => animationLoop(timerContext));
};

export const pause = (timerContext: TTimerContext) => {
    const { audioRef, setTimerStatus, rafRef } = timerContext;
    audioRef.current?.pause();
    setTimerStatus("paused");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
};

export const resume = (timerContext: TTimerContext) => {
    const { audioRef, setTimerStatus, rafRef } = timerContext;
    if (!audioRef.current) return;
    void audioRef.current.play();
    setTimerStatus("running");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => animationLoop(timerContext));
};

export const reset = (timerContext: TTimerContext) => {
    const {
        setTimerStatus,
        setWorkoutPhase,
        setSetIndex,
        setTimeLeft,
        totalDurationRef,
        timelineEndsRef,
        timelineRef,
        setTickPercents,
        rafRef,
        barRef,
        audioRef,
        timeLeftRef,
        settingRef,
    } = timerContext;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try {
        audioRef.current?.pause();
    } catch {}

    setTimerStatus("idle");
    setWorkoutPhase("warmup");
    setSetIndex(1);
    setTimeLeft(settingRef.current?.warmup ?? 10);

    timeLeftRef.current = null;
    totalDurationRef.current = 0;
    timelineEndsRef.current = [];
    timelineRef.current = [];
    setTickPercents([]);
    updateBar(barRef, 0);

    if (audioRef.current?.src) {
        try {
            URL.revokeObjectURL(audioRef.current.src);
        } catch {}
    }
    audioRef.current = null;
};

export const updateSetting = (
    timerContext: TTimerContext,
    settingKey: keyof TSetting,
    delta: number
) => {
    const { setSetting, timerStatusRef, setTimeLeft } = timerContext;

    setSetting((currentSetting) => {
        const newValue = Math.max(0, (currentSetting[settingKey] as number) + delta);
        const nextSetting = { ...currentSetting, [settingKey]: newValue };
        if (settingKey === "warmup" && timerStatusRef.current === "idle") setTimeLeft(newValue);
        return nextSetting;
    });
};

export function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${secs}`;
}
