// @ts-nocheck
import { useState } from "react";
import useFieldTracking from "@/hooks/useFieldTracking";
import FieldAgentHistorySection from "./FieldAgentHistorySection";
import FieldAgentVisitForm from "./FieldAgentVisitForm";
import FieldAgentVisitsHistory from "./FieldAgentVisitsHistory";

export default function FieldAgentTrackingPanel({ employee }) {
    const {
        trackingActive,
        visitStatus,
        setVisitStatus,
        clientName,
        setClientName,
        notes,
        setNotes,
        selectedImage,
        setSelectedImage,
        imagePreview,
        setImagePreview,
        lastPing,
        loading,
        errorMsg,
        currentLocation,
        address,
        sendPing,
        toggleTracking,
        leadType,
        setLeadType,
        projectRequirement,
        setProjectRequirement,
        internshipDomain,
        setInternshipDomain
    } = useFieldTracking(employee);

    const [activeTab, setActiveTab] = useState("tracker"); // "tracker" or "history"

    return (
        <section className="rounded-2xl bg-white/90 border border-slate-200 shadow-sm p-6 backdrop-blur-[1px] space-y-5">
            {/* Header section */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
                        🗺️
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Field Duty Tracker</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Share locations and record visits during your field shift</p>
                    </div>
                </div>

                <button
                    onClick={toggleTracking}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 ${trackingActive
                        ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                        : "bg-ocean-600 hover:bg-ocean-700 text-white"
                        }`}
                >
                    {trackingActive ? (
                        <>
                            <span className="w-2 h-2 bg-white rounded-full animate-ping shrink-0" />
                            Stop Duty
                        </>
                    ) : (
                        "Start Field Duty"
                    )}
                </button>
            </div>

            {/* Tab selection */}
            <div className="flex border-b border-slate-100 gap-6 -mt-1 pb-1">
                <button
                    onClick={() => setActiveTab("tracker")}
                    className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                        activeTab === "tracker"
                            ? "text-ocean-600 border-b-2 border-ocean-600 -mb-[3px]"
                            : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                    🗺️ Tracker Controls
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                        activeTab === "history"
                            ? "text-ocean-600 border-b-2 border-ocean-600 -mb-[3px]"
                            : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                    📜 My Field History
                </button>
                <button
                    onClick={() => setActiveTab("visits")}
                    className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                        activeTab === "visits"
                            ? "text-ocean-600 border-b-2 border-ocean-600 -mb-[3px]"
                            : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                    🎓 Client/Student History
                </button>
            </div>

            {activeTab === "tracker" && (
                <>
                    {/* Inactive state summary */}
                    {!trackingActive && (
                        <div className="flex items-center gap-2 py-2 text-xs text-slate-400 font-semibold bg-slate-50 rounded-2xl px-4 py-3">
                            <span>💡</span>
                            <span>Click "Start Field Duty" to turn on background tracking and record client visits.</span>
                        </div>
                    )}

                    {/* Active state controls */}
                    {trackingActive && (
                        <div className="space-y-5">
                            {/* Status selectors */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Current Activity</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: "Travelling", label: "On the Road", icon: "🚗" },
                                        { id: "At Client", label: "Visiting Client", icon: "🤝" },
                                        { id: "Break", label: "On Break", icon: "☕" },
                                    ].map((status) => (
                                        <button
                                            key={status.id}
                                            onClick={() => setVisitStatus(status.id)}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${visitStatus === status.id
                                                ? "bg-ocean-600 border-ocean-600 text-white shadow-sm shadow-ocean-100"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }`}
                                        >
                                            <span className="mr-1.5">{status.icon}</span>
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Context area based on selected activity */}
                            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50">
                                {visitStatus === "Travelling" && (
                                    <div className="text-xs text-slate-600 leading-relaxed flex items-center gap-3">
                                        <span className="text-xl">🚗</span>
                                        <div>
                                            <p className="font-bold text-slate-800">Route tracking active</p>
                                            <p className="text-slate-500 mt-0.5">Your location coordinates are automatically syncing in the background.</p>
                                        </div>
                                    </div>
                                )}

                                {visitStatus === "Break" && (
                                    <div className="text-xs text-slate-600 leading-relaxed flex items-center gap-3">
                                        <span className="text-xl">☕</span>
                                        <div>
                                            <p className="font-bold text-slate-800">Currently on break</p>
                                            <p className="text-slate-500 mt-0.5">Background tracking remains active, marked as on break.</p>
                                        </div>
                                    </div>
                                )}

                                {visitStatus === "At Client" && (
                                    <FieldAgentVisitForm
                                        leadType={leadType}
                                        setLeadType={setLeadType}
                                        clientName={clientName}
                                        setClientName={setClientName}
                                        projectRequirement={projectRequirement}
                                        setProjectRequirement={setProjectRequirement}
                                        internshipDomain={internshipDomain}
                                        setInternshipDomain={setInternshipDomain}
                                        notes={notes}
                                        setNotes={setNotes}
                                        selectedImage={selectedImage}
                                        setSelectedImage={setSelectedImage}
                                        imagePreview={imagePreview}
                                        setImagePreview={setImagePreview}
                                        loading={loading}
                                        sendPing={sendPing}
                                    />
                                )}
                            </div>

                            {/* Geolocation status bar */}
                            <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] text-slate-400">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Live GPS Connected
                                    </span>
                                    {address && (
                                        <span className="font-semibold text-slate-600 truncate max-w-100 md:max-w-160">
                                            📍 {address}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-3 shrink-0">
                                    {currentLocation && (
                                        <span className="font-medium">
                                            Accuracy: ±{Math.round(currentLocation.accuracy)}m
                                        </span>
                                    )}
                                    {lastPing && (
                                        <span className="font-bold text-slate-500">
                                            Synced: {lastPing.toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === "history" && (
                <FieldAgentHistorySection employee={employee} />
            )}

            {activeTab === "visits" && (
                <FieldAgentVisitsHistory employee={employee} />
            )}

            {errorMsg && (
                <div className="text-xs text-rose-500 font-bold bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2.5">
                    ⚠️ {errorMsg}
                </div>
            )}
        </section>
    );
}
