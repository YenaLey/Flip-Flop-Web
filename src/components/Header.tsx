import Link from "next/link";

export default function Header({
    linkHref = "/logs",
    linkLabel = "기록",
}: {
    linkHref?: string;
    linkLabel?: string;
}) {
    return (
        <header className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold tracking-tight">Async</div>
            <Link
                href={linkHref}
                className="rounded-2xl px-3 py-2 text-sm border border-neutral-200 shadow-sm"
            >
                {linkLabel}
            </Link>
        </header>
    );
}
