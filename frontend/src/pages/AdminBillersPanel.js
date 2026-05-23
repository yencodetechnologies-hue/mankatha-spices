import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, ShieldAlert } from "lucide-react";
import { billerApi } from "../api/billerApi";

const AdminBillersPanel = () => {
  const [billers, setBillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [activeItem, setActiveItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    isActive: true,
  });

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBillers = async () => {
    setLoading(true);
    try {
      const res = await billerApi.list();
      setBillers(res.billers || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load billers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillers();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setActiveItem(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      isActive: true,
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (biller) => {
    setModalMode("edit");
    setActiveItem(biller);
    setFormData({
      name: biller.name || "",
      email: biller.email || "",
      phone: biller.phone || "",
      password: "", // Leave blank, only fill to update
      isActive: biller.isActive !== false,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (modalMode === "add") {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error("Name, email, and password are required.");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await billerApi.create(formData);
      } else {
        if (!formData.name || !formData.email) {
          throw new Error("Name and email are required.");
        }
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password; // Don't update if blank
        } else if (payload.password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await billerApi.update(activeItem._id, payload);
      }
      await fetchBillers();
      closeModal();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || "Failed to save biller.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this biller?")) return;
    try {
      await billerApi.delete(id);
      await fetchBillers();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete biller.");
    }
  };

  const handleStatusChange = async (biller, newStatus) => {
    try {
      const isActive = newStatus === "active";
      await billerApi.update(biller._id, { email: biller.email, name: biller.name, isActive });
      await fetchBillers();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Biller Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage staff accounts with access to the billing system.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          Add Biller
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 text-sm">
          <ShieldAlert size={16} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      Loading billers...
                    </div>
                  </td>
                </tr>
              ) : billers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <p>No billers found. Add a biller to get started.</p>
                  </td>
                </tr>
              ) : (
                billers.map((biller) => (
                  <tr key={biller._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {biller.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {biller.email}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {biller.phone || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={biller.isActive ? "active" : "inactive"}
                        onChange={(e) => handleStatusChange(biller, e.target.value)}
                        className={`text-xs font-semibold uppercase tracking-wide px-2 py-1.5 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                          biller.isActive 
                            ? "bg-green-50 text-green-700" 
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(biller.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(biller)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(biller._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === "add" ? "Add New Biller" : "Edit Biller"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {formError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="ramesh@mankatha.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {modalMode === "add" ? "*" : "(leave blank to keep current)"}
                  </label>
                  <input
                    type="password"
                    required={modalMode === "add"}
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Account is Active
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Biller"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBillersPanel;
