// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import API from "@/api/axios";

export default function useFieldTracking(employee) {
    const [trackingActive, setTrackingActive] = useState(false);
    const [visitStatus, setVisitStatus] = useState("Travelling");
    const [clientName, setClientName] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [lastPing, setLastPing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [currentLocation, setCurrentLocation] = useState(null);
    const [address, setAddress] = useState("");
    const [leadType, setLeadType] = useState("Client");
    const [projectRequirement, setProjectRequirement] = useState("");
    const [internshipDomain, setInternshipDomain] = useState("");
    const pingIntervalRef = useRef(null);

    // Fetch address using Nominatim (free OpenStreetMap reverse geocoding API)
    const fetchAddress = async (lat, lon) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            const addr = data.address;
            if (addr) {
                const parts = [
                    addr.road || addr.suburb || addr.neighbourhood,
                    addr.city || addr.town || addr.municipality,
                    addr.state,
                    addr.postcode
                ].filter(Boolean);
                if (parts.length > 0) return parts.join(", ");
            }
            return data.display_name || "";
        } catch {
            return "";
        }
    };

    const getGPSLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    });
                },
                (error) => {
                    reject(new Error("Please enable location services to share your location."));
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    const sendPing = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const loc = await getGPSLocation();
            setCurrentLocation(loc);

            const addr = await fetchAddress(loc.latitude, loc.longitude);
            setAddress(addr);

            let body;
            let headers = {};

            if (visitStatus === "At Client" && selectedImage) {
                body = new FormData();
                body.append("agentId", employee._id);
                body.append("latitude", loc.latitude);
                body.append("longitude", loc.longitude);
                body.append("accuracy", loc.accuracy);
                body.append("visitStatus", visitStatus);
                body.append("clientName", clientName);
                body.append("notes", notes);
                body.append("address", addr);
                body.append("image", selectedImage);
                body.append("leadType", leadType);
                body.append("projectRequirement", leadType === "Client" ? projectRequirement : "");
                body.append("internshipDomain", leadType === "Internship" ? internshipDomain : "");
                headers["Content-Type"] = "multipart/form-data";
            } else {
                body = {
                    agentId: employee._id,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    accuracy: loc.accuracy,
                    visitStatus,
                    clientName: visitStatus === "At Client" ? clientName : "",
                    notes: visitStatus === "At Client" ? notes : "",
                    address: addr,
                    leadType: visitStatus === "At Client" ? leadType : "",
                    projectRequirement: (visitStatus === "At Client" && leadType === "Client") ? projectRequirement : "",
                    internshipDomain: (visitStatus === "At Client" && leadType === "Internship") ? internshipDomain : "",
                };
            }

            await API.post("/tracking/log", body, { headers });
            setLastPing(new Date());
            setErrorMsg("");

            if (!silent) {
                if (visitStatus === "At Client") {
                    toast.success(leadType === "Client" ? "Client visit logged successfully" : "Internship lead logged successfully");
                    setSelectedImage(null);
                    setImagePreview("");
                    setClientName("");
                    setNotes("");
                    setProjectRequirement("");
                    setInternshipDomain("");
                } else {
                    toast.success("Location updated");
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to update location";
            setErrorMsg(msg);
            if (!silent) toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const toggleTracking = () => {
        if (trackingActive) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
            setTrackingActive(false);
            setClientName("");
            setNotes("");
            setSelectedImage(null);
            setImagePreview("");
            setLeadType("Client");
            setProjectRequirement("");
            setInternshipDomain("");
            toast.success("Field tracking stopped");
        } else {
            setTrackingActive(true);
            sendPing(false);
        }
    };

    // Auto-ping in background every 2 minutes when active
    useEffect(() => {
        if (trackingActive) {
            pingIntervalRef.current = setInterval(() => {
                sendPing(true);
            }, 120000);
        }
        return () => {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
        };
    }, [trackingActive, visitStatus, clientName, notes, leadType, projectRequirement, internshipDomain]);

    return {
        trackingActive,
        visitStatus,
        setVisitStatus,
        clientName,
        setClientName,
        notes,
        setNotes,
        selectedImage,
        setSelectedImage,
        imagePreview,
        setImagePreview,
        lastPing,
        loading,
        errorMsg,
        currentLocation,
        address,
        sendPing,
        toggleTracking,
        leadType,
        setLeadType,
        projectRequirement,
        setProjectRequirement,
        internshipDomain,
        setInternshipDomain
    };
}
