"use client";

import { fmtClock } from "@/lib/timer";
import { Log, Settings } from "@/types";

export default function RecordsSection({
    distance,
    setDistance,
    estimate,
    onSave,
    onPhoto,
    onCompose,
    photoURL,
    logs,
}: {
    distance: string;
    setDistance: (v: string) => void;
    estimate: number;
    onSave: () => void;
    onPhoto: (f: File) => void;
    onCompose: () => void;
    photoURL: string | null;
    logs: Log[];
}) {
    return (
        <section className="mt-5 rounded-3xl p-5 shadow-sm border border-neutral-100 bg-white">
            <div className="font-semibold mb-2">운동 기록</div>
            <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                    거리(km)
                    <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                    />
                </label>
                <div className="text-sm flex items-end">예상 소요 {fmtClock(estimate)}</div>
            </div>
            <div className="mt-3 flex gap-2">
                <button
                    onClick={onSave}
                    className="rounded-xl px-3 py-2 bg-black text-white active:scale-95"
                >
                    기록 저장
                </button>
                <label className="rounded-xl px-3 py-2 border border-neutral-200 text-center active:scale-95">
                    사진 업로드
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onPhoto(f);
                        }}
                    />
                </label>
                <button
                    onClick={onCompose}
                    disabled={!photoURL}
                    className="rounded-xl px-3 py-2 border border-neutral-200 disabled:opacity-30 active:scale-95"
                >
                    사진 저장
                </button>
            </div>
            {photoURL && <img src={photoURL} alt="preview" className="mt-3 rounded-xl" />}

            <div className="mt-5 font-semibold mb-2">기록 목록</div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-neutral-500">
                        <tr>
                            <th className="text-left py-2">날짜</th>
                            <th className="text-right">거리(km)</th>
                            <th className="text-right">페이스(min/km)</th>
                            <th className="text-right">시간</th>
                            <th className="text-right">설정</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((l) => (
                            <tr key={l.id} className="border-t">
                                <td className="py-2">{new Date(l.at).toLocaleString()}</td>
                                <td className="text-right">{l.distanceKm.toFixed(2)}</td>
                                <td className="text-right">
                                    {(() => {
                                        const m = Math.floor(l.paceMinPerKm);
                                        const s = Math.round((l.paceMinPerKm - m) * 60)
                                            .toString()
                                            .padStart(2, "0");
                                        return isFinite(m) ? `${m}:${s}` : "-";
                                    })()}
                                </td>
                                <td className="text-right">{fmtClock(l.elapsedSec)}</td>
                                <td className="text-right">
                                    {l.sets}×({l.runSec}/{l.restSec})
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
