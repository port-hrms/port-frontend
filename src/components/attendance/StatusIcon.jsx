// Line icon for an attendance status (replaces the old emojis)
import { CheckCircle2, Clock3, Plane, TimerReset, XCircle } from "lucide-react";

const ICONS = {
    Present: CheckCircle2,
    Late: Clock3,
    "Half Day": TimerReset,
    Absent: XCircle,
    "On Leave": Plane,
};

export default function StatusIcon({ status, size = 13 }) {
    const Icon = ICONS[status];
    return Icon ? <Icon size={size} aria-hidden="true" className="shrink-0" /> : null;
}
