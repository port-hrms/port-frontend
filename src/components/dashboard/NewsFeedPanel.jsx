import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Megaphone, Pin, ArrowRight } from "lucide-react";
import API from "@/api/axios";
import { config } from "@/config";
import SectionError from "./SectionError";

const PREVIEW_COUNT = 3; // the full list lives on the Announcements page

export default function NewsFeedPanel({ setActiveTab }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await API.get("/announcements", { params: { limit: PREVIEW_COUNT } });
            setAnnouncements(res.data.announcements || []);
            setFailed(false);
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    if (loading) {
        return (
            <div className="panel p-6 min-h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-ocean-100 border-t-ocean-600 rounded-full animate-spin" />
            </div>
        );
    }

    const openAnnouncements = () => setActiveTab("announcements");

    if (failed) {
        return <SectionError title="Company Connect" onRetry={fetchAnnouncements} />;
    }

    return (
        <div className="panel p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-[15px] font-bold text-navy-900 flex items-center gap-2">
                        <Megaphone className="w-4.5 h-4.5 text-ocean-600" />
                        Company Connect
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Latest announcements and news</p>
                </div>
                <button
                    onClick={() => setActiveTab("announcements")}
                    className="text-xs font-semibold text-ocean-700 hover:text-navy-800 bg-ocean-50 hover:bg-ocean-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-4 flex-1">
                {announcements.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8">
                        <Megaphone className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="text-sm font-medium">No recent announcements</p>
                    </div>
                ) : (
                    announcements.map((post) => (
                        <div
                            key={post._id}
                            role="button"
                            tabIndex={0}
                            className="group p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-ocean-200 hover:shadow-sm transition-all cursor-pointer relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300"
                            onClick={openAnnouncements}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    openAnnouncements();
                                }
                            }}
                        >
                            {post.isPinned && (
                                <div className="absolute top-0 right-0 z-10 bg-port-amber text-white py-1 px-2.5 rounded-bl-lg shadow-sm flex items-center gap-1" title="Pinned">
                                    <Pin className="w-3 h-3 fill-white" aria-hidden="true" />
                                    <span className="sr-only">Pinned</span>
                                </div>
                            )}

                            <div className="flex gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-navy-900 text-sm mb-1.5 leading-tight pr-12 lg:pr-0">{post.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>
                                </div>
                                {post.image && (
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm z-0 relative">
                                        <img
                                            src={`${config.imageBaseUrl}${post.image}`}
                                            alt=""
                                            className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200/50">
                                <div className="flex items-center gap-2">
                                    {post.author?.avatar ? (
                                        <img src={post.author.avatar} alt="author" className="w-5 h-5 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-ocean-50 text-navy-700 font-bold flex items-center justify-center shrink-0 text-[10px] uppercase">
                                            {post.author?.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold text-slate-700">{post.author?.name || "Management"}</span>
                                </div>
                                <span className="text-xs font-medium text-slate-500">
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
