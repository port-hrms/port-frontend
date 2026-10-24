// Employee document slots — shared by the form and the detail view
import { FileBadge, FileText, IdCard, Landmark } from "lucide-react";

export const DOCUMENT_TYPES = [
    { key: "bankDetails", label: "Bank Details", desc: "Bank passbook / cancelled cheque", icon: Landmark },
    { key: "aadhar", label: "Aadhaar Card", desc: "Aadhaar front & back", icon: IdCard },
    { key: "resume", label: "Resume / CV", desc: "Latest resume", icon: FileText },
    { key: "offerLetter", label: "Offer Letter", desc: "Signed offer letter", icon: FileBadge },
];
