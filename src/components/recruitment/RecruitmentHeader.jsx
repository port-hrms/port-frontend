// @ts-nocheck
import { Link } from "react-router-dom";

export default function RecruitmentHeader({ onPostJob }) {
    return (
        <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
                <h2 className="text-2xl font-bold text-navy-900">Recruitment</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    Manage job listings and review applicants ·{" "}
                    <Link
                        to="/careers"
                        target="_blank"
                        rel="noreferrer"
                        className="text-ocean-500 hover:underline font-medium"
                    >
                        View public careers page ↗
                    </Link>
                </p>
            </div>
            <button
                onClick={onPostJob}
                className="flex items-center gap-2 bg-linear-to-r from-ocean-600 to-navy-600 hover:from-ocean-700 hover:to-navy-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-ocean-200 transition-all hover:-translate-y-0.5"
            >
                + Post a Job
            </button>
        </div>
    );
}
