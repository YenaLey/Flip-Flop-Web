"use client";

import { Settings } from "@/types";

export default function SettingsCard({
    settings,
    setSettings,
    onBgOn,
    onBgOff,
}: {
    settings: Settings;
    setSettings: (s: Settings) => void;
    onBgOn: () => void;
    onBgOff: () => void;
}) {
    return (
        <section className="mt-5 rounded-3xl p-5 shadow-sm border border-neutral-100 bg-white">
            <div className="font-semibold mb-2">설정</div>
            <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                    Run(sec)
                    <input
                        type="number"
                        inputMode="numeric"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={settings.runSec}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                runSec: Math.max(1, Number(e.target.value || 1)),
                            })
                        }
                    />
                </label>
                <label className="text-sm">
                    Rest(sec)
                    <input
                        type="number"
                        inputMode="numeric"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={settings.restSec}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                restSec: Math.max(1, Number(e.target.value || 1)),
                            })
                        }
                    />
                </label>
                <label className="text-sm">
                    Sets
                    <input
                        type="number"
                        inputMode="numeric"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={settings.sets}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                sets: Math.max(1, Number(e.target.value || 1)),
                            })
                        }
                    />
                </label>
                <label className="text-sm">
                    Warmup(sec)
                    <input
                        type="number"
                        inputMode="numeric"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={settings.warmupSec}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                warmupSec: Math.max(0, Number(e.target.value || 0)),
                            })
                        }
                    />
                </label>
                <label className="col-span-2 text-sm">
                    Beep volume
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                        value={settings.volume}
                        onChange={(e) =>
                            setSettings({ ...settings, volume: Number(e.target.value) })
                        }
                    />
                </label>
            </div>
            <div className="mt-3 text-xs text-neutral-500">iOS/Android 백그라운드 유지 보조</div>
            <div className="mt-2">
                <button
                    onClick={onBgOn}
                    className="rounded-xl px-3 py-2 border border-neutral-200 mr-2 active:scale-95"
                >
                    백그라운드 모드 ON
                </button>
                <button
                    onClick={onBgOff}
                    className="rounded-xl px-3 py-2 border border-neutral-200 active:scale-95"
                >
                    OFF
                </button>
            </div>
        </section>
    );
}
