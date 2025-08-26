"use client";

import { useEffect, useRef } from "react";

const SILENT_DATA =
    "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function useAudio(volume: number) {
    const ctxRef = useRef<AudioContext | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const bgRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (gainRef.current) gainRef.current.gain.value = volume;
    }, [volume]);

    const ensure = async () => {
        if (!ctxRef.current) {
            ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            gainRef.current = ctxRef.current.createGain();
            gainRef.current.gain.value = volume;
            gainRef.current.connect(ctxRef.current.destination);
        }
        if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    };

    const beep = async (freq = 880, ms = 140) => {
        await ensure();
        const ctx = ctxRef.current!;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(1.0, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
        osc.connect(g).connect(gainRef.current!);
        osc.start();
        osc.stop(ctx.currentTime + ms / 1000 + 0.02);
        if (navigator.vibrate) navigator.vibrate(20);
    };

    const bgStart = async () => {
        if (!bgRef.current) {
            const el = new Audio(SILENT_DATA);
            el.loop = true;
            el.preload = "auto";
            el.volume = 0.02;
            bgRef.current = el;
            document.body.appendChild(el);
        }
        await bgRef.current!.play().catch(() => {});
    };

    const bgStop = () => {
        bgRef.current?.pause();
    };

    return { beep, bgStart, bgStop };
}
