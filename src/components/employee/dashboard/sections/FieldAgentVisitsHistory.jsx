// @ts-nocheck
import { useState, useEffect } from "react";
import API from "@/api/axios";
import toast from "react-hot-toast";
import FieldAgentVisitsFilterBar from "./FieldAgentVisitsFilterBar";
import FieldAgentVisitCard from "./FieldAgentVisitCard";
import FieldAgentVisitsPagination from "./FieldAgentVisitsPagination";

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export default function FieldAgentVisitsHistory({ employee }) {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [leadTypeFilter, setLeadTypeFilter] = useState("All"); // "All", "Client", "Internship"
    const [selectedDate, setSelectedDate] = useState(""); // "" means all dates
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const fetchVisits = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/tracking/visits/${employee._id}`);
            if (data?.success) {
                setVisits(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch visits history:", error);
            toast.error("Failed to load visits history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employee?._id) {
            fetchVisits();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee?._id]);

    // Reset pagination when search queries or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, leadTypeFilter, selectedDate]);

    // Filtering logic
    const filteredVisits = visits.filter((visit) => {
        const matchesSearch = (visit.clientName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        
        const matchesFilter =
            leadTypeFilter === "All" ||
            visit.leadType === leadTypeFilter;

        const matchesDate =
            !selectedDate ||
            new Date(visit.createdAt).toISOString().split("T")[0] === selectedDate;

        return matchesSearch && matchesFilter && matchesDate;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
    const paginatedVisits = filteredVisits.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Group only the paginated visits by local date string
    const groupedVisits = paginatedVisits.reduce((groups, visit) => {
        const dateKey = formatDate(visit.createdAt);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(visit);
        return groups;
    }, {});

    return (
        <div className="space-y-5 animate-fadeIn">
            <FieldAgentVisitsFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                leadTypeFilter={leadTypeFilter}
                setLeadTypeFilter={setLeadTypeFilter}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                loading={loading}
                onRefresh={fetchVisits}
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-xs font-medium">Loading visits history...</p>
                </div>
            ) : Object.keys(groupedVisits).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-slate-400 bg-slate-50/20 border border-slate-100 rounded-2xl">
                    <div className="text-4xl mb-3">📂</div>
                    <p className="text-xs font-bold text-slate-500">No client or student visits found</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Try modifying your search or filters.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {Object.keys(groupedVisits).map((dateKey) => (
                            <div key={dateKey} className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                        📅 {dateKey}
                                    </span>
                                    <div className="h-px bg-slate-100 flex-1" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {groupedVisits[dateKey].map((visit) => (
                                        <FieldAgentVisitCard
                                            key={visit._id}
                                            visit={visit}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <FieldAgentVisitsPagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                    />
                </>
            )}
        </div>
    );
}
