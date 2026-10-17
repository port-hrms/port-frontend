// @ts-nocheck
import React from "react";

export default function LocationPhotoUploader({
    selectedImage,
    setSelectedImage,
    imagePreview,
    setImagePreview
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location Photo (Optional)</label>
            <div className="flex items-center gap-4">
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl px-4 py-3 cursor-pointer transition-all bg-white hover:bg-slate-50">
                    <span className="text-sm">📸</span>
                    <span className="text-xs font-bold text-slate-600">Upload Live Photo</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setSelectedImage(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }}
                    />
                </label>

                {imagePreview && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedImage(null);
                                setImagePreview("");
                            }}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
