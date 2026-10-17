// @ts-nocheck
export default function FieldAgentVisitsPagination({
    currentPage,
    setCurrentPage,
    totalPages,
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
            <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-350 disabled:border-slate-100 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
                ← Previous
            </button>

            <span className="text-xs font-bold text-slate-500">
                Page {currentPage} of {totalPages}
            </span>

            <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-350 disabled:border-slate-100 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
                Next →
            </button>
        </div>
    );
}
