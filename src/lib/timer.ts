export function createTicker(onTick: (now: number) => void) {
    const blob = new Blob(
        [
            `let t;self.onmessage=e=>{if(e.data==='start'){clearInterval(t);t=setInterval(()=>postMessage(performance.now()),200)}if(e.data==='stop'){clearInterval(t)}};`,
        ],
        { type: "text/javascript" }
    );
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    URL.revokeObjectURL(url);
    w.onmessage = (e) => onTick(e.data as number);
    return w;
}

export const fmtClock = (s: number) => {
    const m = Math.floor(s / 60)
        .toString()
        .padStart(2, "0");
    const ss = Math.floor(s % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${ss}`;
};
