"use client";

export function useBeep(volume: number) {
    let ctx: AudioContext | null = null;
    const ensure = async () => {
        if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === "suspended") await ctx.resume();
    };
    const beep = async (freq = 900, ms = 80) => {
        await ensure();
        const g = ctx!.createGain();
        const o = ctx!.createOscillator();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.value = volume;
        o.connect(g).connect(ctx!.destination);
        o.start();
        o.stop(ctx!.currentTime + ms / 1000);
        (navigator as any).vibrate?.(15);
    };
    return beep;
}

const SILENT =
    "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function useBgAudio() {
    let el: HTMLAudioElement | null = null;
    const on = async (title = "Async") => {
        if (!el) {
            el = new Audio(SILENT);
            el.loop = true;
            el.volume = 0.02;
            document.body.appendChild(el);
        }
        try {
            const ms = (navigator as any).mediaSession;
            if (ms && (window as any).MediaMetadata)
                ms.metadata = new (window as any).MediaMetadata({ title });
        } catch {}
        await el.play().catch(() => {});
    };
    const off = () => {
        el?.pause();
    };
    return { on, off };
}
