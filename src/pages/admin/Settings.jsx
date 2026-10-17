// client/src/pages/Settings.jsx
// ─────────────────────────────────────────────────────────────
// Settings page — Profile, Password, User Management (Admin)
// ─────────────────────────────────────────────────────────────

import ChangePassword from "@/components/settings/ChangePassword";
import ProfileSettings from "@/components/settings/ProfileSettings";
import UserManagement from "@/components/settings/UserManagement";
import CompanySettings from "@/components/settings/CompanySettings";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account and system preferences</p>
            </div>

            {/* Profile Settings */}
            <ProfileSettings />

            {/* Change Password */}
            <ChangePassword />

            {/* Company Settings — Admin Only */}
            {user?.role === "admin" && <CompanySettings />}

            {/* User Management — Admin Only */}
            {user?.role === "admin" && <UserManagement />}
        </div>
    );
}
