import { useState, useRef, useEffect } from "react";
import { CheckCircle2, CreditCard, FileText, Landmark, ShieldCheck, XCircle } from "lucide-react";
import API from "@/api/axios";
import toast from "react-hot-toast";
import { config } from "@/config";

// Dynamically load the Razorpay checkout.js script (only once)
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

// ─── Sub-components defined OUTSIDE to avoid re-creation on every render ─────

function ReviewScreen({ payroll, net, totalDeductions, loading, paymentError, onPay }) {
    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Employee Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-lg font-extrabold shrink-0">
                    {payroll.employee?.firstName?.[0]}{payroll.employee?.lastName?.[0]}
                </div>
                <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                        {payroll.employee?.firstName} {payroll.employee?.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {payroll.employee?.employeeId} · {payroll.employee?.department}
                    </p>
                </div>
            </div>

            {/* Salary Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-indigo-500" /> Salary Breakdown
                    </h4>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Razorpay Secure
                    </span>
                </div>
                <div className="p-5 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                        <span>Basic Pay</span>
                        <span className="font-medium">₹{Number(payroll?.earnings?.basic || 0).toLocaleString("en-IN")}</span>
                    </div>
                    {(payroll?.earnings?.hra > 0 || payroll?.earnings?.bonus > 0) && (
                        <div className="flex justify-between text-slate-600">
                            <span>Allowances (HRA &amp; Bonus)</span>
                            <span className="font-medium text-emerald-600">
                                +₹{((payroll?.earnings?.hra || 0) + (payroll?.earnings?.bonus || 0)).toLocaleString("en-IN")}
                            </span>
                        </div>
                    )}
                    {totalDeductions > 0 && (
                        <div className="flex justify-between text-slate-600">
                            <span>Deductions (PF, ESI, Tax, Leave)</span>
                            <span className="font-medium text-red-500">-₹{totalDeductions.toLocaleString("en-IN")}</span>
                        </div>
                    )}
                    <hr className="border-slate-100" />
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">Net Payable</span>
                        <span className="text-xl font-black text-slate-900">₹{net.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>

            {/* Error banner if previous attempt failed */}
            {paymentError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{paymentError}</span>
                </div>
            )}

            {/* Test mode helper */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 space-y-2">
                <p className="font-bold text-amber-900">🧪 Test Mode — How to complete payment:</p>
                <div className="space-y-0.5">
                    <p className="font-semibold">✅ Netbanking (auto-selected):</p>
                    <p className="font-mono bg-amber-100 px-2 py-1 rounded">HDFC Bank is pre-selected → just click "Pay Now" → click "Success"</p>
                </div>
                <div className="space-y-0.5">
                    <p className="font-semibold">✅ Or switch to UPI tab:</p>
                    <p className="font-mono bg-amber-100 px-2 py-1 rounded">Enter UPI ID: success@razorpay</p>
                </div>
            </div>

            {/* Pay Button */}
            <button
                onClick={onPay}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2.5"
            >
                <CreditCard className="w-5 h-5" />
                Pay ₹{net.toLocaleString("en-IN")} via Razorpay
            </button>
        </div>
    );
}

function LoadingScreen({ statusText }) {
    return (
        <div className="py-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Landmark className="w-7 h-7 text-indigo-600 animate-pulse" />
                </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Please Wait</h3>
            <p className="text-slate-500 text-sm">{statusText}</p>
        </div>
    );
}

function SuccessScreen({ net, paymentResult, payroll, onDone }) {
    return (
        <div className="py-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-100/50">
                <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">Transfer Successful!</h3>
            <p className="text-slate-500 mb-6 text-sm">
                ₹{net.toLocaleString("en-IN")} disbursed to {payroll.employee?.firstName} {payroll.employee?.lastName}
            </p>
            <div className="bg-slate-50 w-full rounded-2xl p-5 border border-slate-100 text-left space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-500">Payment ID</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{paymentResult.paymentId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Order ID</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{paymentResult.orderId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-800">{paymentResult.date}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Gateway</span>
                    <span className="font-bold text-indigo-600">Razorpay</span>
                </div>
            </div>
            <button
                onClick={onDone}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all"
            >
                Done &amp; Close
            </button>
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function RazorpayPaymentModal({ payroll, onClose, onSuccess, apiPath }) {
    const [loading, setLoading]             = useState(false);
    const [statusText, setStatusText]       = useState("");
    const [paymentResult, setPaymentResult] = useState(null);
    const [paymentError, setPaymentError]   = useState(null);
    const rzpRef = useRef(null); // store rzp instance for cleanup

    // Close Razorpay popup if modal unmounts mid-payment (Priority 1 fix)
    useEffect(() => {
        return () => {
            rzpRef.current?.close();
        };
    }, []);

    // ─── Salary calculation ───────────────────────────────────
    const gross = Number(payroll?.earnings?.basic || 0)
        + Number(payroll?.earnings?.hra   || 0)
        + Number(payroll?.earnings?.bonus || 0);
    const totalDeductions =
          Number(payroll?.deductions?.pf             || 0)
        + Number(payroll?.deductions?.ptax           || 0)
        + Number(payroll?.deductions?.esi            || 0)
        + Number(payroll?.deductions?.leaveDeduction || 0);
    const net = gross - totalDeductions;

    // ─── Open Razorpay checkout ───────────────────────────────
    const handlePayment = async () => {
        setPaymentError(null);
        setLoading(true);
        setStatusText("Loading payment gateway...");

        try {
            // 1. Load checkout.js
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK. Check your internet connection.");

            // 2. Create order on backend
            setStatusText("Creating secure order...");
            const orderEndpoint = apiPath
                ? `${apiPath}/${payroll._id}/razorpay-order`
                : `/payroll/${payroll._id}/razorpay-order`;

            const { data } = await API.post(orderEndpoint);
            const { order, key_id } = data;

            // 3. Build checkout options
            setStatusText("Opening checkout...");
            const options = {
                key:         key_id,
                amount:      order.amount,
                currency:    order.currency,
                name:        config.razorpayCompanyName,
                description: `Salary for ${payroll.employee?.firstName} ${payroll.employee?.lastName}`,
                order_id:    order.id,

                // ── SUCCESS handler ──────────────────────────
                handler: async function (response) {
                    try {
                        setLoading(true);
                        setStatusText("Verifying payment...");

                        const verifyEndpoint = apiPath
                            ? `${apiPath}/${payroll._id}/verify-payment`
                            : `/payroll/${payroll._id}/verify-payment`;

                        await API.post(verifyEndpoint, {
                            razorpay_order_id:   response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature:  response.razorpay_signature,
                        });

                        toast.success("Payment successful & recorded! ✅");
                        setPaymentResult({
                            orderId:   response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            date:      new Date().toLocaleDateString("en-IN"),
                        });
                    } catch (verifyErr) {
                        const msg = verifyErr.response?.data?.message || verifyErr.message;
                        toast.error("Verification failed: " + msg);
                        setPaymentError("Signature verification failed: " + msg);
                    } finally {
                        setLoading(false);
                        setStatusText("");
                    }
                },

                // ── prefill — auto-select HDFC Netbanking for easy test mode ─
                prefill: {
                    name:    `${payroll.employee?.firstName || ""} ${payroll.employee?.lastName || ""}`.trim(),
                    email:   config.razorpayPrefillEmail,
                    contact: "9999999999",
                    method:  "netbanking",
                    bank:    "HDFC",
                },

                config: {
                    display: {
                        preferences: { show_default_blocks: true },
                    },
                },

                theme: { color: "#4F46E5" },

                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setStatusText("");
                        if (!paymentResult) toast("Payment window closed.", { icon: "ℹ️" });
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzpRef.current = rzp; // store for cleanup on unmount

            // Capture payment failure events explicitly
            rzp.on("payment.failed", function (resp) {
                const errDesc = resp.error?.description || resp.error?.reason || "Payment failed";
                const errCode = resp.error?.code || "";
                console.error("[Razorpay Payment Failed]", resp.error);
                setPaymentError(`${errDesc} (${errCode})`);
                toast.error("Payment failed: " + errDesc);
                setLoading(false);
                setStatusText("");
            });

            // Hide loading overlay before opening Razorpay popup
            setLoading(false);
            setStatusText("");
            rzp.open();

        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to initialize payment.";
            toast.error(msg);
            setPaymentError(msg);
            setLoading(false);
            setStatusText("");
        }
    };

    // ─── Render ───────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900">Razorpay Gateway</h2>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Secure Salary Disbursal</p>
                        </div>
                    </div>
                    {!loading && !paymentResult && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors text-lg"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-7 overflow-y-auto flex-1">
                    {loading ? (
                        <LoadingScreen statusText={statusText} />
                    ) : paymentResult ? (
                        <SuccessScreen
                            net={net}
                            paymentResult={paymentResult}
                            payroll={payroll}
                            onDone={() => { onSuccess(); onClose(); }}
                        />
                    ) : (
                        <ReviewScreen
                            payroll={payroll}
                            net={net}
                            totalDeductions={totalDeductions}
                            loading={loading}
                            paymentError={paymentError}
                            onPay={handlePayment}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
