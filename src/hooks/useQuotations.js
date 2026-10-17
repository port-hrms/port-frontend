import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { quotationAPI } from "../api/quotationAPI";
import { downloadHTMLAsPDF } from "../utils/pdfHelper";

const initialItem = { service: "", description: "", quantity: 1, price: 0 };

export default function useQuotations(setActiveTab) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(null);
  const [editing, setEditing] = useState(null);
  const [downloadingQuotation, setDownloadingQuotation] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [form, setForm] = useState({
    clientId: "",
    items: [{ ...initialItem }],
    tax: 0,
    discount: 0,
    notes: "",
    validTill: "",
    termsAndConditions: [
      "50% advance payment is required to initiate the work.",
      "Balance payment to be cleared after completion of the work.",
      "GST will be charged extra as applicable.",
    ],
    closingNote:
      "Kindly share the payment confirmation once completed so we can proceed with the project initiation.\nPlease feel free to contact us for any clarification or confirmation.\nLooking forward to your approval.",
  });

  const fetchQuotations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await quotationAPI.getAll({ search, page, limit: 10 });
      setQuotations(data.data.quotations);
      setPagination({ page: data.data.page, pages: data.data.pages, total: data.data.total });
    } catch (err) {
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await quotationAPI.getStats();
      setStats(data.data);
    } catch {}
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const { data } = await quotationAPI.getClients();
      setClients(data.data.clients);
    } catch {}
  }, []);

  const fetchCompanySettings = useCallback(async () => {
    try {
      const { data } = await quotationAPI.getCompanySettings();
      setCompanySettings(data.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
    fetchClients();
    fetchCompanySettings();
  }, [fetchStats, fetchClients, fetchCompanySettings]);

  useEffect(() => {
    const timer = setTimeout(() => fetchQuotations(1), 300);
    return () => clearTimeout(timer);
  }, [search, fetchQuotations]);

  useEffect(() => {
    const subtotal = form.items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.price) || 0), 0);
    const calculatedTax = Math.round(subtotal * 0.18);
    setForm((prev) => {
      if (prev.tax === calculatedTax) return prev;
      return { ...prev, tax: calculatedTax };
    });
  }, [form.items]);

  const calcTotals = (items, tax, discount) => {
    const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.price) || 0), 0);
    const t = parseFloat(tax) || 0;
    const d = parseFloat(discount) || 0;
    return { subtotal, total: subtotal + t - d };
  };

  const handleSubmit = async () => {
    if (!form.clientId || !form.items.length || !form.validTill) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const payload = {
        ...form,
        tax: parseFloat(form.tax) || 0,
        discount: parseFloat(form.discount) || 0,
        items: form.items.map((i) => ({
          ...i,
          quantity: parseInt(i.quantity) || 1,
          price: parseFloat(i.price) || 0,
        })),
      };
      if (editing) {
        await quotationAPI.update(editing._id, payload);
        toast.success("Quotation updated successfully");
      } else {
        await quotationAPI.create(payload);
        toast.success("Quotation created successfully");
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchQuotations(pagination.page);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () =>
    setForm({
      clientId: "",
      items: [{ ...initialItem }],
      tax: 0,
      discount: 0,
      notes: "",
      validTill: "",
      termsAndConditions: [
        "50% advance payment is required to initiate the work.",
        "Balance payment to be cleared after completion of the work.",
        "GST will be charged extra as applicable.",
      ],
      closingNote:
        "Kindly share the payment confirmation once completed so we can proceed with the project initiation.\nPlease feel free to contact us for any clarification or confirmation.\nLooking forward to your approval.",
    });

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      clientId: q.clientId?._id || q.clientId,
      items: q.items.map((i) => ({ ...i })),
      tax: q.tax,
      discount: q.discount,
      notes: q.notes || "",
      validTill: q.validTill?.slice(0, 10) || "",
      termsAndConditions: q.termsAndConditions?.length
        ? q.termsAndConditions
        : [
            "50% advance payment is required to initiate the work.",
            "Balance payment to be cleared after completion of the work.",
            "GST will be charged extra as applicable.",
          ],
      closingNote:
        q.closingNote ||
        "Kindly share the payment confirmation once completed so we can proceed with the project initiation.\nPlease feel free to contact us for any clarification or confirmation.\nLooking forward to your approval.",
    });
    setShowModal(true);
  };

  const handleDelete = async (q) => {
    if (!window.confirm(`Delete quotation ${q.quotationNumber}?`)) return;
    try {
      await quotationAPI.delete(q._id);
      toast.success("Quotation deleted");
      fetchQuotations(pagination.page);
      fetchStats();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await quotationAPI.updateStatus(id, status);
      toast.success(`Quotation ${status.toLowerCase()}`);
      fetchQuotations(pagination.page);
      fetchStats();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      toast.loading("Preparing PDF...", { id: "pdf-download" });
      const { data } = await quotationAPI.getById(id);
      const fullQuotation = data.data;

      setDownloadingQuotation(fullQuotation);

      // Wait for React to render the off-screen template
      setTimeout(async () => {
        try {
          await downloadHTMLAsPDF("capture-quotation-pdf-target", `quotation-${fullQuotation.quotationNumber}.pdf`);
          toast.success("PDF downloaded successfully", { id: "pdf-download" });
        } catch (err) {
          console.error(err);
          toast.error("Failed to generate PDF", { id: "pdf-download" });
        } finally {
          setDownloadingQuotation(null);
        }
      }, 150);
    } catch (err) {
      toast.error("Failed to load quotation details", { id: "pdf-download" });
    }
  };

  const handleSendEmail = async (id) => {
    try {
      await quotationAPI.sendEmail(id);
      toast.success("Quotation sent via email");
    } catch {
      toast.error("Failed to send email");
    }
  };

  const handleGenerateInvoice = async (q) => {
    if (!window.confirm(`Generate invoice from ${q.quotationNumber}?`)) return;
    try {
      await quotationAPI.convertToInvoice(q._id);
      toast.success("Invoice generated successfully");
      if (setActiveTab) {
        setActiveTab("invoices");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate invoice");
    }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...initialItem }] });
  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const { subtotal, total } = calcTotals(form.items, form.tax, form.discount);

  return {
    quotations,
    loading,
    search,
    setSearch,
    clients,
    stats,
    pagination,
    showModal,
    setShowModal,
    showView,
    setShowView,
    editing,
    setEditing,
    downloadingQuotation,
    companySettings,
    form,
    setForm,
    subtotal,
    total,
    fetchQuotations,
    handleSubmit,
    resetForm,
    openEdit,
    handleDelete,
    handleStatus,
    handleDownloadPDF,
    handleSendEmail,
    handleGenerateInvoice,
    addItem,
    removeItem,
    updateItem,
  };
}
