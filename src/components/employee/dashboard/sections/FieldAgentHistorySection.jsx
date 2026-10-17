// @ts-nocheck
import { useState, useEffect } from "react";
import API from "@/api/axios";
import toast from "react-hot-toast";

const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
};

const STATUS_ICONS = {
    Travelling: "🚗",
    "At Client": "🤝",
    Break: "☕",
};

const STATUS_STYLES = {
    Travelling: "bg-blue-50 text-blue-700 border-blue-100",
    "At Client": "bg-emerald-50 text-emerald-700 border-emerald-100",
    Break: "bg-amber-50 text-amber-700 border-amber-100",
};

export default function FieldAgentHistorySection({ employee }) {
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split("T")[0]);
    const [historyData, setHistoryData] = useState(null);
    const [histLoading, setHistLoading] = useState(false);

    const fetchHistory = async () => {
        try {
            setHistLoading(true);
            const { data } = await API.get(`/tracking/history/${employee._id}`, {
                params: { date: historyDate }
            });
            setHistoryData(data);
        } catch (error) {
            console.error("Failed to fetch field history:", error);
            toast.error("Failed to load field history");
        } finally {
            setHistLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyDate]);

    return (
        <div className="space-y-5 animate-fadeIn">
            {/* Date Picker */}
            <div className="bg-slate-50/50 rounded-2xl border border-slate-100/50 p-4 flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select History Date</span>
                    <input
                        type="date"
                        value={historyDate}
                        onChange={(e) => setHistoryDate(e.target.value)}
                        className="px-3.5 py-2 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                    />
                </div>
                <button
                    onClick={fetchHistory}
                    disabled={histLoading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                    {histLoading ? "Refreshing..." : "🔄 Refresh"}
                </button>
            </div>

            {histLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-xs font-medium">Loading field history...</p>
                </div>
            ) : historyData ? (
                <>
                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Total Pings", value: historyData.summary.totalPings, icon: "📍", style: "bg-blue-50/50 border-blue-100 text-blue-700" },
                            { label: "Visited", value: historyData.summary.clientsVisited.length, icon: "🤝", style: "bg-emerald-50/50 border-emerald-100 text-emerald-700" },
                            { label: "Time on Field", value: `${historyData.summary.timeOnField}m`, icon: "⏱️", style: "bg-violet-50/50 border-violet-100 text-violet-700" },
                        ].map((card) => (
                            <div key={card.label} className={`rounded-xl border p-3 shadow-2xs ${card.style} flex flex-col items-center text-center`}>
                                <div className="text-lg mb-1">{card.icon}</div>
                                <div className="text-sm font-extrabold">{card.value}</div>
                                <div className="text-[9px] font-bold opacity-80 mt-0.5">{card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50">
                        <div className="bg-slate-50/50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-800">Visit Log</span>
                            <span className="text-[10px] text-slate-400 font-bold">{historyData.data.length} logs</span>
                        </div>

                        {historyData.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <div className="text-3xl mb-2">📭</div>
                                <p className="text-xs font-semibold text-slate-500">No tracking logs for this date</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                                {historyData.data.map((ping, index) => (
                                    <div key={ping._id} className="p-4 flex items-start gap-3 hover:bg-slate-50/40 transition-colors">
                                        <div className="flex flex-col items-center shrink-0 mt-0.5">
                                            <div className={`w-2.5 h-2.5 rounded-full border border-white shadow-xs
                                                ${ping.visitStatus === "At Client" ? "bg-emerald-500"
                                                                            : ping.visitStatus === "Break" ? "bg-amber-500"
                                                                                : "bg-blue-500"}`}
                                            />
                                            {index < historyData.data.length - 1 && (
                                                <div className="w-0.5 h-8 bg-slate-100 mt-1" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 text-xs">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-extrabold text-slate-700">
                                                    {formatTime(ping.createdAt)}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${STATUS_STYLES[ping.visitStatus]}`}>
                                                    {STATUS_ICONS[ping.visitStatus]} {ping.visitStatus}
                                                </span>
                                                {ping.clientName && (
                                                    <span className="font-bold text-emerald-600">
                                                        {ping.leadType === "Internship" ? "🎓 Student: " : "🤝 Client: "}
                                                        <span className="text-slate-800 font-semibold">{ping.clientName}</span>
                                                    </span>
                                                )}
                                            </div>
                                            {ping.address && (
                                                <p className="text-slate-400 mt-1">📍 {ping.address}</p>
                                            )}
                                            {ping.leadType === "Client" && ping.projectRequirement && (
                                                <p className="text-slate-600 mt-1 bg-slate-50/50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                                                    📋 <b>Project / Req:</b> {ping.projectRequirement}
                                                </p>
                                            )}
                                            {ping.leadType === "Internship" && ping.internshipDomain && (
                                                <p className="text-slate-600 mt-1 bg-slate-50/50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                                                    💻 <b>Domain:</b> {ping.internshipDomain}
                                                </p>
                                            )}
                                            {ping.notes && (
                                                <p className="text-slate-600 mt-1 bg-slate-50/50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                                                    💬 {ping.notes}
                                                </p>
                                            )}
                                            {ping.visitImage && (
                                                <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                                    <img
                                                        src={`${API.defaults.baseURL.replace("/api", "")}${ping.visitImage}`}
                                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                        alt="Visit Location"
                                                        onClick={() => window.open(`${API.defaults.baseURL.replace("/api", "")}${ping.visitImage}`, "_blank")}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <p className="text-xs font-semibold">Select a date and click refresh to load history.</p>
                </div>
            )}
        </div>
    );
}
