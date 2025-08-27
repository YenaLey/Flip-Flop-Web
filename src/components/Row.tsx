"use client";

export default function Row(props: {
    label: string;
    value: number;
    dec: () => void;
    inc: () => void;
}) {
    const { label, value, dec, inc } = props;
    return (
        <div className="mt-3 flex flex-row items-center justify-between">
            <span className="text-lg">{label}</span>
            <div className="flex flex-row items-center gap-3">
                <button onClick={dec} className="rounded-2xl border px-3 py-1.5">
                    -
                </button>
                <span className="w-14 text-center">{value}</span>
                <button onClick={inc} className="rounded-2xl border px-3 py-1.5">
                    +
                </button>
            </div>
        </div>
    );
}
