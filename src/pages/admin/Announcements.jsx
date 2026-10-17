import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";
import { 
    Megaphone, 
    Pin, 
    Send,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import API from "../../api/axios";

const PAGE_SIZE = 2;
import AnnouncementItem from "../../components/announcements/AnnouncementItem";

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [commentData, setCommentData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    
    // For main post creation
    const { register, handleSubmit, reset } = useForm();

    const fetchAnnouncements = async () => {
        try {
            const res = await API.get("/announcements");
            setAnnouncements(res.data.announcements);
            setCurrentPage(1);
        } catch (error) {
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // ─── Post Actions ───
    const onSubmitPost = async (data) => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("content", data.content);
            if (data.isPinned) formData.append("isPinned", data.isPinned);
            if (data.image && data.image[0]) formData.append("image", data.image[0]);

            await API.post("/announcements", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Announcement posted successfully!");
            reset();
            // Reset file input explicitly if needed, but react-hook-form handles it
            fetchAnnouncements();
        } catch (error) {
            toast.error("Failed to post announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await API.delete(`/announcements/${id}`);
            toast.success("Announcement deleted");
            const updated = announcements.filter(a => a._id !== id);
            setAnnouncements(updated);
            // If we deleted the last item on this page, go back one page
            const newTotalPages = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
            if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
        } catch (error) {
            toast.error("Failed to delete announcement");
        }
    };

    const toggleLike = async (id) => {
        try {
            const res = await API.put(`/announcements/${id}/like`);
            setAnnouncements(announcements.map(a => 
                a._id === id ? { ...a, likes: res.data.likes } : a
            ));
        } catch (error) {
            toast.error("Failed to update like");
        }
    };

    // ─── Comment Actions ───
    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!commentData[postId] || commentData[postId].trim() === "") return;
        
        try {
            const res = await API.post(`/announcements/${postId}/comments`, {
                text: commentData[postId]
            });
            // Update comments in state
            setAnnouncements(announcements.map(a => 
                a._id === postId ? { ...a, comments: res.data.comments } : a
            ));
            // Clear input
            setCommentData({ ...commentData, [postId]: "" });
            toast.success("Comment added");
        } catch (error) {
            toast.error("Failed to add comment");
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            const res = await API.delete(`/announcements/${postId}/comments/${commentId}`);
            setAnnouncements(announcements.map(a => 
                a._id === postId ? { ...a, comments: res.data.comments } : a
            ));
            toast.success("Comment deleted");
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        Company News Feed
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Broadcast updates and stay connected with the entire team.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Create post form */}
                <div className="lg:col-span-5 relative order-first lg:sticky lg:top-6 self-start">
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <Send className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Create Post</h2>
                        </div>

                        <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Announcement Title</label>
                                <input
                                    {...register("title", { required: true })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder-slate-400"
                                    placeholder="e.g., Q3 Town Hall Meeting"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Message Body</label>
                                <textarea
                                    {...register("content", { required: true })}
                                    rows={5}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder-slate-400 resize-none"
                                    placeholder="What's happening?"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attach Image (Optional)</label>
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register("image")}
                                        className="w-full text-sm font-medium text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        {...register("isPinned")}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                    />
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-1.5">
                                        <Pin className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                        Pin to top
                                    </span>
                                </label>
                                
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                                >
                                    {isSubmitting ? "Posting..." : "Publish"}
                                    {!isSubmitting && <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Feed */}
                <div className="lg:col-span-7 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Megaphone className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No Announcements Yet</h3>
                            <p className="text-slate-500 text-sm mt-1">Be the first to share an update with the team.</p>
                        </div>
                    ) : (
                        <>
                            {announcements
                                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                                .map((post) => (
                                    <AnnouncementItem
                                        key={post._id}
                                        post={post}
                                        handleDeletePost={handleDeletePost}
                                        toggleLike={toggleLike}
                                        handleCommentSubmit={handleCommentSubmit}
                                        handleDeleteComment={handleDeleteComment}
                                        commentData={commentData}
                                        setCommentData={setCommentData}
                                    />
                                ))}

                            {/* Pagination */}
                            {Math.ceil(announcements.length / PAGE_SIZE) > 1 && (
                                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                                    <button
                                        onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: Math.ceil(announcements.length / PAGE_SIZE) }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all duration-200 ${
                                                    page === currentPage
                                                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                                                        : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => { setCurrentPage(p => Math.min(Math.ceil(announcements.length / PAGE_SIZE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        disabled={currentPage === Math.ceil(announcements.length / PAGE_SIZE)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
