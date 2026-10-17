// @ts-nocheck
import API from "@/api/axios";

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

export default function FieldAgentVisitCard({ visit }) {
    const isInternship = visit.leadType === "Internship";

    return (
        <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
                {/* Header (Lead badge + Time) */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2.5 mb-3">
                    <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            isInternship
                                ? "bg-violet-50 text-violet-700 border-violet-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                    >
                        {isInternship ? "🎓 Student Lead" : "🤝 Client Lead"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                        ⏱️ {formatTime(visit.createdAt)}
                    </span>
                </div>

                {/* Body Info */}
                <div className="space-y-2 text-xs">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">
                            {isInternship ? "Student Name" : "Client / Company"}
                        </p>
                        <p className="font-extrabold text-slate-800 mt-0.5">{visit.clientName}</p>
                    </div>

                    {!isInternship && visit.projectRequirement && (
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Project Requirement</p>
                            <p className="text-slate-600 font-semibold mt-0.5 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                                📋 {visit.projectRequirement}
                            </p>
                        </div>
                    )}

                    {isInternship && visit.internshipDomain && (
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Internship Domain</p>
                            <p className="text-slate-600 font-semibold mt-0.5 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                                💻 {visit.internshipDomain}
                            </p>
                        </div>
                    )}

                    {visit.notes && (
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Meeting Notes</p>
                            <p className="text-slate-500 font-medium mt-0.5 italic">
                                "{visit.notes}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer location + Thumbnail */}
            <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                    {visit.address && (
                        <p className="text-[10px] text-slate-400 font-semibold truncate" title={visit.address}>
                            📍 {visit.address}
                        </p>
                    )}
                </div>

                {visit.visitImage && (
                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img
                            src={`${API.defaults.baseURL.replace("/api", "")}${visit.visitImage}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            alt="Visit Attachment"
                            onClick={() =>
                                window.open(
                                    `${API.defaults.baseURL.replace("/api", "")}${visit.visitImage}`,
                                    "_blank"
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
