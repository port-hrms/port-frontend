// @ts-nocheck
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import SuperAdminAPI from "../api/superadminAxios";

const SuperAdminContext = createContext();

export function SuperAdminProvider({ children }) {
    const [admin, setAdmin] = useState(() => {
        try {
            const token = localStorage.getItem("sa_token");
            const userData = localStorage.getItem("sa_user");
            if (token && userData) {
                return JSON.parse(userData);
            }
        } catch {
            localStorage.removeItem("sa_token");
            localStorage.removeItem("sa_user");
        }
        return null;
    });
    const [loading, setLoading] = useState(false);

    const login = useCallback(async (email, password) => {
        try {
            const { data } = await SuperAdminAPI.post("/superadmin/login", { email, password });
            localStorage.setItem("sa_token", data.token);
            localStorage.setItem("sa_user", JSON.stringify(data.user));
            setAdmin(data.user);
            toast.success(data.message || "Welcome!");
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            return { success: false, message };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("sa_token");
        localStorage.removeItem("sa_user");
        setAdmin(null);
        toast.success("Logged out");
    }, []);

    const value = useMemo(() => ({ admin, loading, login, logout, isLoggedIn: !!admin }), [admin, loading, login, logout]);

    return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
}

export const useSuperAdmin = () => {
    const ctx = useContext(SuperAdminContext);
    if (!ctx) throw new Error("useSuperAdmin must be used inside SuperAdminProvider");
    return ctx;
};
