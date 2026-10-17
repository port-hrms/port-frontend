// Dreamonix brand mark — vector icon + wordmark (replaces the old image logo).
// tone: "dark" for light backgrounds, "light" for dark backgrounds.

export function BrandIcon({ className = "w-9 h-9" }) {
    return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
            <defs>
                <linearGradient id="brandmark-bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#1e88c8" />
                    <stop offset="1" stopColor="#0b3b5e" />
                </linearGradient>
            </defs>
            <rect width="40" height="40" rx="10" fill="url(#brandmark-bg)" />
            {/* Stylised "D" sail over a wave */}
            <path d="M13 9.5V25h5.5c5.2 0 8.5-3.2 8.5-7.8S23.7 9.5 18.5 9.5Z" fill="#fff" />
            <path d="M16.5 13h2c3 0 4.8 1.6 4.8 4.2s-1.8 4.3-4.8 4.3h-2Z" fill="#1676b6" />
            <path d="M7 30.5c2.2 0 2.2-1.6 4.4-1.6s2.2 1.6 4.4 1.6 2.2-1.6 4.4-1.6 2.2 1.6 4.4 1.6 2.2-1.6 4.4-1.6 2.2 1.6 4.4 1.6" fill="none" stroke="#bfe0f4" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

export default function BrandMark({ tone = "dark", compact = false, className = "", iconClassName = "w-9 h-9" }) {
    const name = tone === "light" ? "text-white" : "text-navy-900";
    const sub = tone === "light" ? "text-ocean-200" : "text-ocean-600";

    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <BrandIcon className={`${iconClassName} shrink-0`} />
            {!compact && (
                <span className="flex flex-col leading-none">
                    <span className={`font-[Montserrat] text-lg font-bold tracking-tight ${name}`}>Dreamonix</span>
                    <span className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.25em] ${sub}`}>HRMS</span>
                </span>
            )}
        </span>
    );
}
