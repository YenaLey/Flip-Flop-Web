"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadLogs, saveLogs } from "@/lib/storage";
import type { Log } from "@/types";

const fmt = (s: number) => {
    const m = Math.floor(s / 60)
        .toString()
        .padStart(2, "0");
    const ss = Math.floor(s % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${ss}`;
};

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        setLogs(loadLogs());
    }, []);

    const remove = (id: string) => {
        if (confirm("삭제하시겠습니까?")) {
            const next = logs.filter((l) => l.id !== id);
            setLogs(next);
            saveLogs(next);
            alert("삭제되었습니다.");
        }
    };

    const clearAll = () => {
        if (confirm("전체 삭제하시겠습니까?")) {
            setLogs([]);
            saveLogs([]);
            alert("삭제되었습니다.");
        }
    };

    return (
        <main className="mx-auto max-w-sm px-4 pb-24 pt-6">
            <header className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold tracking-tight">Async Log</div>
                <Link
                    href="/"
                    className="rounded-2xl px-3 py-2 text-sm border border-neutral-200 shadow-sm"
                >
                    타이머
                </Link>
            </header>

            <section className="rounded-3xl p-5 shadow-sm border border-neutral-100 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-neutral-500">
                            <tr>
                                <th className="text-left py-2">날짜</th>
                                <th className="text-right">총시간</th>
                                <th className="text-right">설정</th>
                                <th className="text-right">삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((l) => (
                                <tr key={l.id} className="border-t">
                                    <td className="py-2">{new Date(l.at).toLocaleString()}</td>
                                    <td className="text-right">{fmt(l.totalSec)}</td>
                                    <td className="text-right">
                                        {l.sets}×({l.runSec}/{l.restSec}) + warmup {l.warmupSec}
                                    </td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => remove(l.id)}
                                            className="rounded-lg px-2 py-1 border"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={clearAll}
                        className="rounded-xl px-3 py-2 border border-neutral-200"
                    >
                        전체 삭제
                    </button>
                </div>
            </section>
        </main>
    );
}
