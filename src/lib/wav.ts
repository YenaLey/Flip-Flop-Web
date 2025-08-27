export function makeTimelineWavUrl(
    segments: Array<{ start: number; len: number; phase: string }>,
    vol: number
) {
    const sr = 44100;
    const end = segments.reduce((a, s) => Math.max(a, s.start + s.len), 0) + 0.6;
    const pcm = new Float32Array(Math.ceil(end * sr));

    const tone = (start: number, dur: number, freq: number, amp = 0.7) => {
        const a = Math.floor(start * sr);
        const n = Math.floor(dur * sr);
        for (let i = 0; i < n; i++) {
            const t = i / sr;
            const e = Math.min(1, t / 0.005) * Math.min(1, (dur - t) / 0.005);
            pcm[a + i] += Math.sin(2 * Math.PI * freq * t) * amp * e;
        }
    };

    for (const seg of segments) {
        for (let i = 10; i >= 1; i--)
            if (seg.len - i > 0) tone(seg.start + (seg.len - i), 0.08, 900, 0.7);
        tone(seg.start + seg.len, 0.12, 900, 0.7);
        tone(seg.start + seg.len + 0.16, 0.18, 600, 0.7);
    }

    const i16 = new Int16Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) {
        const v = Math.max(-1, Math.min(1, pcm[i])) * vol;
        i16[i] = (v * 32767) | 0;
    }

    const bytes = 44 + i16.length * 2;
    const dv = new DataView(new ArrayBuffer(bytes));
    const ws = (o: number, s: string) => {
        for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
    };

    ws(0, "RIFF");
    dv.setUint32(4, bytes - 8, true);
    ws(8, "WAVE");
    ws(12, "fmt ");
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true);
    dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * 2, true);
    dv.setUint16(32, 2, true);
    dv.setUint16(34, 16, true);
    ws(36, "data");
    dv.setUint32(40, i16.length * 2, true);
    for (let i = 0; i < i16.length; i++) dv.setInt16(44 + i * 2, i16[i], true);

    return URL.createObjectURL(new Blob([dv.buffer], { type: "audio/wav" }));
}
