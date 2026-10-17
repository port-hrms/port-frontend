// @ts-nocheck

const ROLE_STYLES = {
    admin: "bg-ocean-400/15 text-ocean-300",
    hr: "bg-ocean-400/15 text-ocean-300",
    employee: "bg-port-green/20 text-emerald-300",
};

export default function AdminProfileCard({ user, onLogout }) {
    return (
        <div className="px-3 py-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-ocean-400 to-navy-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-white text-xs font-bold truncate">{user?.name}</p>
                    <p className="text-ocean-100/50 text-xs truncate">{user?.email}</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold capitalize ${ROLE_STYLES[user?.role]}`}>
                    {user?.role}
                </span>
                <button onClick={onLogout} className="text-xs text-ocean-100/50 hover:text-port-red font-semibold transition-colors">
                    Sign out
                </button>
            </div>
        </div>
    );
}
