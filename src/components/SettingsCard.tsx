"use client";

export type SettingsForm = {
    run: string;
    rest: string;
    sets: string;
    warmup: string;
    volume: number;
};

type Props = { form: SettingsForm; setForm: (f: SettingsForm) => void };

export default function SettingsCard({ form, setForm }: Props) {
    return (
        <section className="mt-5 rounded-3xl p-5 shadow-sm border border-neutral-100 bg-white">
            <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                    Run(sec)
                    <input
                        type="text"
                        inputMode="numeric"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={form.run}
                        onChange={(e) => setForm({ ...form, run: e.target.value })}
                    />
                </label>
                <label className="text-sm">
                    Rest(sec)
                    <input
                        type="text"
                        inputMode="numeric"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={form.rest}
                        onChange={(e) => setForm({ ...form, rest: e.target.value })}
                    />
                </label>
                <label className="text-sm">
                    Sets
                    <input
                        type="text"
                        inputMode="numeric"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={form.sets}
                        onChange={(e) => setForm({ ...form, sets: e.target.value })}
                    />
                </label>
                <label className="text-sm">
                    Warmup(sec)
                    <input
                        type="text"
                        inputMode="numeric"
                        className="w-full mt-1 rounded-xl border px-3 py-2"
                        value={form.warmup}
                        onChange={(e) => setForm({ ...form, warmup: e.target.value })}
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
                        value={form.volume}
                        onChange={(e) => setForm({ ...form, volume: Number(e.target.value) })}
                    />
                </label>
            </div>
        </section>
    );
}
