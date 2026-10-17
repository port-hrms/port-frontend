import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function useCompanySettings() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    gstin: "",
    state: "",
    stateCode: "21",
    contact: "",
    email: "",
    hrEmail: "",
    bank: {
      holder: "",
      bank: "",
      account: "",
      branch: "",
      ifsc: "",
    },
    logo: "",
    signature: "",
    latitude: 20.296059,
    longitude: 85.824539,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/settings/company");
        if (data.data) {
          setForm({
            name: data.data.name || "",
            address: data.data.address || "",
            gstin: data.data.gstin || "",
            state: data.data.state || "",
            stateCode: data.data.stateCode || "21",
            contact: data.data.contact || "",
            email: data.data.email || "",
            hrEmail: data.data.hrEmail || "",
            bank: {
              holder: data.data.bank?.holder || "",
              bank: data.data.bank?.bank || "",
              account: data.data.bank?.account || "",
              branch: data.data.bank?.branch || "",
              ifsc: data.data.bank?.ifsc || "",
            },
            logo: data.data.logo || "",
            signature: data.data.signature || "",
            latitude: data.data.latitude !== undefined ? data.data.latitude : 20.296059,
            longitude: data.data.longitude !== undefined ? data.data.longitude : 85.824539,
          });
        }
      } catch (err) {
        toast.error("Failed to load company settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      bank: { ...prev.bank, [name]: value },
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.gstin.trim() || !form.contact.trim()) {
      return toast.error("Name, Address, GSTIN, and Contact details are required");
    }

    try {
      setSaving(true);
      await API.put("/settings/company", form);
      toast.success("Company settings updated successfully! ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update company settings");
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    loading,
    saving,
    handleChange,
    handleBankChange,
    handleFileChange,
    handleSubmit,
  };
}
