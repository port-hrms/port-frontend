// @ts-nocheck
import LocationPhotoUploader from "./LocationPhotoUploader";

export default function FieldAgentVisitForm({
    leadType,
    setLeadType,
    clientName,
    setClientName,
    projectRequirement,
    setProjectRequirement,
    internshipDomain,
    setInternshipDomain,
    notes,
    setNotes,
    selectedImage,
    setSelectedImage,
    imagePreview,
    setImagePreview,
    loading,
    sendPing
}) {
    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Lead / Visit Type Selector */}
            <div className="bg-slate-100/50 p-3 rounded-2xl border border-slate-200/50">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lead / Visit Type</span>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                        <input
                            type="radio"
                            name="leadType"
                            value="Client"
                            checked={leadType === "Client"}
                            onChange={() => setLeadType("Client")}
                            className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-slate-300"
                        />
                        💼 Client Lead
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                        <input
                            type="radio"
                            name="leadType"
                            value="Internship"
                            checked={leadType === "Internship"}
                            onChange={() => setLeadType("Internship")}
                            className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-slate-300"
                        />
                        🎓 Students
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leadType === "Client" ? (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Client / Company Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Acme Corp"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project / Requirement</label>
                            <input
                                type="text"
                                placeholder="e.g. E-Commerce Website, Mobile App"
                                value={projectRequirement}
                                onChange={(e) => setProjectRequirement(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Domain</label>
                            <input
                                type="text"
                                placeholder="e.g. Web Development"
                                value={internshipDomain}
                                onChange={(e) => setInternshipDomain(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Visit Notes / Remarks</label>
                    <textarea
                        placeholder="Enter any additional details or feedback..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors resize-none"
                    />
                </div>
            </div>

            <LocationPhotoUploader
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
            />

            <div className="flex items-center gap-3">
                <button
                    onClick={() => sendPing(false)}
                    disabled={loading || !clientName.trim() || (leadType === "Internship" && !internshipDomain)}
                    className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                    {loading ? "Recording..." : leadType === "Client" ? "Log Client Visit" : "Log Internship Lead"}
                </button>
            </div>
        </div>
    );
}
