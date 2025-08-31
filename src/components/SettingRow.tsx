export default function SettingRow({
    label,
    value,
    onDecrease,
    onIncrease,
}: {
    label: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
}) {
    return (
        <div className="mt-3 flex flex-row items-center justify-between">
            <span className="text-lg">{label}</span>
            <div className="flex flex-row items-center gap-3">
                <button onClick={onDecrease} className="rounded-2xl border px-3 py-1.5">
                    -
                </button>
                <span className="w-14 text-center">{value}</span>
                <button onClick={onIncrease} className="rounded-2xl border px-3 py-1.5">
                    +
                </button>
            </div>
        </div>
    );
}
