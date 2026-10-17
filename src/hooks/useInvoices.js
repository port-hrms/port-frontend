import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(null);
  const [editing, setEditing] = useState(null);
  const [clients, setClients] = useState([]);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [form, setForm] = useState({
    clientId: "",
    items: [{ service: "", description: "", quantity: 1, price: 0 }],
    tax: 0,
    discount: 0,
    dueDate: "",
    notes: "",
  });

  const fetchInvoices = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await API.get("/invoices", { params: { search, page, limit: 10 } });
      setInvoices(data.data.invoices);
      setPagination({ page: data.data.page, pages: data.data.pages, total: data.data.total });
    } catch (err) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get("/invoices/stats");
      setStats(data.data);
    } catch {}
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const { data } = await API.get("/clients", { params: { limit: 200 } });
      setClients(data.data.clients);
    } catch {}
  }, []);

  const fetchCompanySettings = useCallback(async () => {
    try {
      const { data } = await API.get("/settings/company");
      setCompanySettings(data.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
    fetchClients();
    fetchCompanySettings();
  }, [fetchStats, fetchClients, fetchCompanySettings]);

  useEffect(() => {
    const timer = setTimeout(() => fetchInvoices(1), 300);
    return () => clearTimeout(timer);
  }, [search, fetchInvoices]);

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
    return { subtotal, total: subtotal + (parseFloat(tax) || 0) - (parseFloat(discount) || 0) };
  };

  const handleSubmit = async () => {
    if (!form.clientId || !form.items.length || !form.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const payload = {
        ...form,
        tax: parseFloat(form.tax) || 0,
        discount: parseFloat(form.discount) || 0,
        items: form.items.map((i) => ({ ...i, quantity: parseInt(i.quantity) || 1, price: parseFloat(i.price) || 0 })),
      };
      if (editing) {
        await API.put(`/invoices/${editing._id}`, payload);
        toast.success("Invoice updated");
      } else {
        await API.post("/invoices", payload);
        toast.success("Invoice created");
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchInvoices(pagination.page);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setForm({ clientId: "", items: [{ service: "", description: "", quantity: 1, price: 0 }], tax: 0, discount: 0, dueDate: "", notes: "" });
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({
      clientId: inv.clientId?._id || inv.clientId,
      items: inv.items.map((i) => ({ ...i })),
      tax: inv.tax,
      discount: inv.discount,
      dueDate: inv.dueDate?.slice(0, 10) || "",
      notes: inv.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (inv) => {
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) return;
    try {
      await API.delete(`/invoices/${inv._id}`);
      toast.success("Invoice deleted");
      fetchInvoices(pagination.page);
      fetchStats();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      toast.loading("Preparing PDF...", { id: "pdf-download" });
      const { data } = await API.get(`/invoices/${id}`);
      const fullInvoice = data.data;

      setDownloadingInvoice(fullInvoice);

      // Wait for React to render the off-screen template
      setTimeout(async () => {
        const element = document.getElementById("capture-pdf-target");
        if (!element) {
          setDownloadingInvoice(null);
          toast.dismiss("pdf-download");
          return;
        }
        try {
          const html2canvas = (await import("html2canvas")).default;
          const { jsPDF } = await import("jspdf");

          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
          });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
          pdf.save(`invoice-${fullInvoice.invoiceNumber}.pdf`);
          toast.success("PDF downloaded successfully", { id: "pdf-download" });
        } catch (err) {
          console.error(err);
          toast.error("Failed to generate PDF", { id: "pdf-download" });
        } finally {
          setDownloadingInvoice(null);
        }
      }, 150);
    } catch (err) {
      toast.error("Failed to load invoice details", { id: "pdf-download" });
    }
  };

  const handleSendEmail = async (id) => {
    try {
      await API.post(`/invoices/${id}/send-email`);
      toast.success("Invoice sent via email");
    } catch {
      toast.error("Failed to send email");
    }
  };

  const handleMarkPaid = async (inv) => {
    const txId = prompt("Transaction ID (optional):");
    try {
      await API.patch(`/invoices/${inv._id}/payment-status`, {
        paymentStatus: "Paid",
        transactionId: txId || "",
        paymentDate: new Date().toISOString(),
      });
      toast.success("Marked as paid");
      fetchInvoices(pagination.page);
      fetchStats();
    } catch {
      toast.error("Failed to update");
    }
  };

  const { total: formTotal } = calcTotals(form.items, form.tax, form.discount);

  return {
    invoices,
    loading,
    search,
    setSearch,
    stats,
    pagination,
    showModal,
    setShowModal,
    showView,
    setShowView,
    editing,
    setEditing,
    clients,
    downloadingInvoice,
    companySettings,
    form,
    setForm,
    formTotal,
    fetchInvoices,
    handleSubmit,
    resetForm,
    openEdit,
    handleDelete,
    handleDownloadPDF,
    handleSendEmail,
    handleMarkPaid,
  };
}
