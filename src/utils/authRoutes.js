// @ts-nocheck
export const getDashboardPathByRole = (userOrRole) => {
    const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
    
    const isHR = role === "employee" && userOrRole !== role && (
        userOrRole?.department?.toLowerCase() === "hr" || 
        userOrRole?.designation?.toLowerCase() === "hr"
    );

    if (role === "admin" || isHR) {
        return "/admin/dashboard";
    }

    if (role === "employee") {
        return "/employee/dashboard";
    }

    return "/";
};