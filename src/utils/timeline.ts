import type { TSetting, TTimelineSegment } from "@/types";

/**
 * 사용자 설정값으로 Timeline 데이터를 생성
 * @param setting warmup/work/rest/cooldown, sets, volume 설정값
 * @returns TimelineSegment 배열, 각 구간이 끝나는 누적 시간 목록, 전체 시간
 */
export function createTimeline(setting: TSetting) {
    let totalDuration = 0;
    const timeline: TTimelineSegment[] = [];
    const timelineEnds: number[] = [];

    if (setting.warmup > 0) {
        timeline.push({ phase: "warmup", duration: setting.warmup, setIndex: 0 });
    }
    for (let i = 1; i <= setting.sets; i++) {
        timeline.push({ phase: "work", duration: setting.work, setIndex: i });
        if (i < setting.sets) {
            timeline.push({ phase: "rest", duration: setting.rest, setIndex: i });
        }
    }
    if (setting.cooldown > 0) {
        timeline.push({ phase: "cooldown", duration: setting.cooldown, setIndex: 0 });
    }

    for (const segment of timeline) {
        timelineEnds.push(totalDuration + segment.duration);
        totalDuration += segment.duration;
    }

    return { timeline, timelineEnds, totalDuration };
}

/**
 * Timeline 데이터로 비프 소리를 가진 오디오 생성
 * - Timeline을 누적 시간 축으로 변환  → PCM 버퍼에 톤 기록 → WAV 헤더를 붙여 Blob 생성 → 재생 가능한 URL 반환
 * @param timelineSegments TimelineSegment 배열
 * @param totalDuration 전체 시간
 * @param volume 볼륨(0~1)
 * @returns 오디오 URL
 */
export function createAudio(timeline: TTimelineSegment[], totalDuration: number, volume: number) {
    const sampleRate = 44100;
    const tail = 0.6;
    const pcmBuffer = new Float32Array(Math.ceil((totalDuration + tail) * sampleRate));

    const generateTone = (
        startTime: number,
        duration: number,
        frequency: number,
        amplitude = 0.7
    ) => {
        const startIndex = Math.floor(startTime * sampleRate);
        const sampleCount = Math.floor(duration * sampleRate);
        for (let i = 0; i < sampleCount; i++) {
            const t = i / sampleRate;
            const env = Math.min(1, t / 0.005) * Math.min(1, (duration - t) / 0.005);
            pcmBuffer[startIndex + i] += Math.sin(2 * Math.PI * frequency * t) * amplitude * env;
        }
    };

    let offset = 0;
    for (const segment of timeline) {
        for (let c = 10; c >= 1; c--) {
            if (segment.duration - c > 0) {
                generateTone(offset + (segment.duration - c), 0.08, 900, 0.7);
            }
        }
        generateTone(offset + segment.duration, 0.12, 900, 0.7);
        generateTone(offset + segment.duration + 0.16, 0.18, 600, 0.7);
        offset += segment.duration;
    }

    const int16 = new Int16Array(pcmBuffer.length);
    for (let i = 0; i < pcmBuffer.length; i++) {
        const v = Math.max(-1, Math.min(1, pcmBuffer[i])) * volume;
        int16[i] = (v * 32767) | 0;
    }

    const bytes = 44 + int16.length * 2;
    const dv = new DataView(new ArrayBuffer(bytes));
    const write = (o: number, s: string) => {
        for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
    };

    write(0, "RIFF");
    dv.setUint32(4, bytes - 8, true);
    write(8, "WAVE");
    write(12, "fmt ");
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, sampleRate * 2, true);
    dv.setUint16(32, 2, true);
    dv.setUint16(34, 16, true);
    write(36, "data");
    dv.setUint32(40, int16.length * 2, true);
    for (let i = 0; i < int16.length; i++) dv.setInt16(44 + i * 2, int16[i], true);

    return URL.createObjectURL(new Blob([dv.buffer], { type: "audio/wav" }));
}
