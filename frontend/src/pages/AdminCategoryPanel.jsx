import React, { useEffect, useMemo, useState } from "react";
import { productApi } from "../api/productApi";
import { categoryApi } from "../api/categoryApi";
import { getBackendOrigin } from "../api/adminApiBase";
import { Package, Tag, Plus, X, Pencil, Trash2 } from "lucide-react";

const AdminCategoryPanel = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Add modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(null); // { id, name }
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete confirm modal
  const [deleteModal, setDeleteModal] = useState(null); // { id, name }
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchData = async () => {
    const cachedCats = categoryApi.getCached();
    if (cachedCats) {
      const catList = cachedCats.categories || [];
      setCategories(catList);
      if (catList.length > 0) {
        setSelectedCategory((prev) =>
          catList.find((c) => c._id === prev?._id) ? prev : catList[0]
        );
      }
    }
    const cachedProds = productApi.getCached();
    if (cachedProds) setProducts(cachedProds.products || []);

    setErrorMessage("");

    try {
      const catRes = await categoryApi.list();
      const catList = catRes.categories || [];
      setCategories(catList);
      if (catList.length > 0) {
        setSelectedCategory((prev) =>
          catList.find((c) => c._id === prev?._id) ? prev : catList[0]
        );
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to load categories.");
    }

    try {
      const prodRes = await productApi.getProducts();
      setProducts(prodRes.products || []);
    } catch (error) {
      setErrorMessage((prev) => prev || error.response?.data?.message || "Failed to load products.");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach((cat) => {
      counts[cat._id] = products.filter((p) => p.category === cat.name).length;
    });
    return counts;
  }, [products, categories]);

  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === selectedCategory?.name);
  }, [products, selectedCategory]);

  // ── Add ────────────────────────────────────────────────────
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSubmitting(true);
    try {
      setErrorMessage("");
      await categoryApi.create(newCategoryName.trim(), newCategoryImage);
      setNewCategoryName("");
      setNewCategoryImage(null);
      setAddModalOpen(false);
      await fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to add category.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────
  const openEdit = (cat, e) => {
    e.stopPropagation();
    setEditModal(cat);
    setEditName(cat.name);
    setEditImage(null);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editModal) return;
    setEditSubmitting(true);
    try {
      setErrorMessage("");
      await categoryApi.rename(editModal._id, editName.trim(), editImage);
      setEditModal(null);
      await fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to rename category.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const openDelete = (cat, e) => {
    e.stopPropagation();
    setDeleteModal(cat);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleteSubmitting(true);
    try {
      setErrorMessage("");
      await categoryApi.remove(deleteModal._id);
      if (selectedCategory?._id === deleteModal._id) setSelectedCategory(null);
      setDeleteModal(null);
      await fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to delete category.");
      setDeleteModal(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="category-panel mx-auto max-w-6xl">
      <header className="products-head mb-6 flex justify-between items-center">
        <div>
          <h2>Categories</h2>
    
        </div>
        <button
          type="button"
          className="top-add-btn flex items-center gap-2"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus size={16} /> Add Category
        </button>
      </header>

      {errorMessage && !errorMessage.toLowerCase().includes("not found") && (
        <div className="status-error mb-4" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Category list */}
        <div className="md:col-span-1 flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#78909C] mb-2 px-1">
            Spice Groups
          </h3>
          {categories.map((cat) => {
            const count = categoryCounts[cat._id] || 0;
            const isSelected = selectedCategory?._id === cat._id;
            return (
              <div
                key={cat._id}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-[#6b9312] border-[#6b9312] text-white shadow-md"
                    : "bg-white border-[#f0e8dc] text-[#37474F] hover:bg-[#F5F5F5]"
                }`}
              >
                {/* Name + count */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Tag size={18} className={isSelected ? "text-white" : "text-[#78909C]"} />
                  <span className="font-medium text-sm sm:text-base truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#faf7f2] text-[#8c6239]"
                    }`}
                  >
                    {count} {count === 1 ? "Product" : "Products"}
                  </span>

                  {/* Edit button */}
                  <button
                    type="button"
                    title="Rename"
                    onClick={(e) => openEdit(cat, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? "hover:bg-white/20 text-white"
                        : "text-[#6b9312] hover:bg-[#eaf0d8]"
                    }`}
                    style={{ boxShadow: "none", background: "transparent", border: "none" }}
                  >
                    <Pencil size={14} />
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    title="Delete"
                    onClick={(e) => openDelete(cat, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? "hover:bg-white/20 text-white"
                        : "text-red-500 hover:bg-red-50"
                    }`}
                    style={{ boxShadow: "none", background: "transparent", border: "none" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Products under selected category */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-[#f0e8dc] bg-white p-6 shadow-sm min-h-[400px]">
            <div className="border-b border-[#ECEFF1] pb-4 mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#263238]">
                {selectedCategory?.name || "No Category Selected"}
              </h3>
              <span className="text-sm text-[#78909C]">
                {categoryProducts.length} items found
              </span>
            </div>

            {categoryProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#78909C]">
                <Package size={48} strokeWidth={1.5} className="mb-3 text-[#B0BEC5]" />
                <p className="text-sm"></p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#ECEFF1] text-xs uppercase tracking-wide text-[#78909C]">
                      <th className="py-2.5 pr-4 font-semibold">SKU</th>
                      <th className="py-2.5 pr-4 font-semibold">Product Name</th>
                      <th className="py-2.5 pr-4 font-semibold text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProducts.map((p) => (
                      <tr key={p._id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] text-[#37474F]">
                        <td className="py-3 pr-4 font-mono text-xs text-[#8c6239]">{p.sku}</td>
                        <td className="py-3 pr-4 font-medium">{p.name}</td>
                        <td className={`py-3 pr-4 text-right font-semibold ${p.stock <= 0 ? "text-red-500" : "text-[#37474F]"}`}>
                          {p.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Category Modal ── */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button type="button" className="modal-close-btn" onClick={() => setAddModalOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="modal-form">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Masala"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Category Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCategoryImage(e.target.files?.[0] || null)}
                />
              </div>
              <div className="actions-row modal-actions">
                <button type="button" onClick={() => setAddModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit (Rename) Modal ── */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Category</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditModal(null)}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleRename} className="modal-form">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Update Image</label>
                {editModal?.image && (
                  <div className="mb-2">
                    <img 
                      src={`${getBackendOrigin()}${editModal.image}`} 
                      alt="Current Category" 
                      className="h-16 w-16 object-cover rounded border"
                    />
                    <span className="text-xs text-gray-500 block mt-1">Current Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                />
              </div>
              <div className="actions-row modal-actions">
                <button type="button" onClick={() => setEditModal(null)} disabled={editSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={editSubmitting}>
                  {editSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h3>Delete Category</h3>
              <button type="button" className="modal-close-btn" onClick={() => setDeleteModal(null)}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-form">
              <p style={{ color: "#374151", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                Are you sure you want to delete{" "}
                <strong style={{ color: "#b45309" }}>{deleteModal.name}</strong>?
                <br />
                <small style={{ color: "#6b7280" }}>
                  Any products in this category will become uncategorized.
                </small>
              </p>
              <div className="actions-row modal-actions">
                <button type="button" onClick={() => setDeleteModal(null)} disabled={deleteSubmitting}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteSubmitting}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {deleteSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryPanel;
