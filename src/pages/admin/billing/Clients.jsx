import { useEffect, useState, useCallback } from "react";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import API from "@/api/axios";
import ClientModal from "./components/ClientModal";
import ClientDetailModal from "./components/ClientDetailModal";

const initialForm = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  gstNumber: "",
  address: "",
  status: "Active",
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchClients = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await API.get("/clients", { params: { search, page, limit: 10 } });
      setClients(data.data.clients);
      setPagination({ page: data.data.page, pages: data.data.pages, total: data.data.total });
    } catch (err) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchClients(1), 300);
    return () => clearTimeout(timer);
  }, [search, fetchClients]);

  const handleSubmit = async () => {
    if (!form.name || !form.companyName || !form.email || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      if (editing) {
        await API.put(`/clients/${editing._id}`, form);
        toast.success("Client updated successfully");
      } else {
        await API.post("/clients", form);
        toast.success("Client created successfully");
      }
      setShowModal(false);
      setEditing(null);
      setForm(initialForm);
      fetchClients(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete client "${client.name}"?`)) return;
    try {
      await API.delete(`/clients/${client._id}`);
      toast.success("Client deleted successfully");
      fetchClients(pagination.page);
    } catch (err) {
      toast.error("Failed to delete client");
    }
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      phone: client.phone,
      gstNumber: client.gstNumber || "",
      address: client.address || "",
      status: client.status,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your client relationships</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Client ID", "Client Name", "Company", "Email", "Phone", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">Loading...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">No clients found</td></tr>
              ) : clients.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-700">{c.clientId || c._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.companyName}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.email}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.phone}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${c.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowDetail(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Eye size={13} /></button>
                      <button onClick={() => openEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchClients(pagination.page - 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">Prev</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchClients(pagination.page + 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ClientModal
          editing={editing}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetail && (
        <ClientDetailModal
          client={showDetail}
          onClose={() => setShowDetail(null)}
        />
      )}
    </div>
  );
}
