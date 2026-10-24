// Employee photo with initials fallback
import { useState } from "react";
import { config } from "../../config";

const COLORS = ["bg-navy-700", "bg-ocean-600", "bg-navy-600", "bg-ocean-500", "bg-port-teal", "bg-navy-500"];

export default function EmployeeAvatar({ employee, className = "h-9 w-9 text-xs" }) {
    const [broken, setBroken] = useState(false);
    const first = employee?.firstName || "";
    const last = employee?.lastName || "";
    const initials = `${first[0] || ""}${last[0] || ""}`.toUpperCase();
    const color = COLORS[(first.charCodeAt(0) || 0) % COLORS.length];

    if (employee?.avatar && !broken) {
        return (
            <img
                src={`${config.serverBaseUrl}${employee.avatar}`}
                alt={`${first} ${last}`}
                onError={() => setBroken(true)}
                className={`${className} shrink-0 rounded-full object-cover`}
            />
        );
    }
    return (
        <span className={`${className} ${color} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}>
            {initials}
        </span>
    );
}
