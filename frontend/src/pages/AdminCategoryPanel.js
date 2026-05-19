import React, { useEffect, useMemo, useState } from "react";
import { productApi } from "../api/productApi";
import { categoryApi } from "../api/categoryApi";
import { Package, Tag, Plus, X } from "lucide-react";

const AdminCategoryPanel = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    // 1. Populate immediately from cache if available
    const cachedCats = categoryApi.getCached();
    if (cachedCats) {
      const catList = (cachedCats.categories || []).map((c) => c.name);
      setCategories(catList);
      if (catList.length > 0) {
        setSelectedCategory((prev) => (catList.includes(prev) ? prev : catList[0]));
      }
    }
    const cachedProds = productApi.getCached();
    if (cachedProds) {
      setProducts(cachedProds.products || []);
    }

    // 2. Silently fetch from server in background
    setErrorMessage("");
    
    try {
      const catRes = await categoryApi.list();
      const catList = (catRes.categories || []).map((c) => c.name);
      setCategories(catList);
      if (catList.length > 0) {
        setSelectedCategory((prev) => (catList.includes(prev) ? prev : catList[0]));
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to load category data.");
    }

    try {
      const prodRes = await productApi.getProducts();
      setProducts(prodRes.products || []);
    } catch (error) {
      setErrorMessage((prev) => prev || error.response?.data?.message || "Failed to load category products.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute product counts for each category
  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach((cat) => {
      counts[cat] = products.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [products, categories]);

  // Filter products by selected category
  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSubmitting(true);
    try {
      setErrorMessage("");
      await categoryApi.create(newCategoryName.trim());
      setNewCategoryName("");
      setAddModalOpen(false);
      await fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to add category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="category-panel mx-auto max-w-6xl">
      <header className="products-head mb-6 flex justify-between items-center">
        <div>
          <h2>Categories</h2>
          <p>Manage and view your spice offerings grouped by category type.</p>
        </div>
        <button
          type="button"
          className="top-add-btn flex items-center gap-2"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus size={16} /> Add Category
        </button>
      </header>

      {errorMessage && (
        <div className="status-error mb-4" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Category list card */}
        <div className="md:col-span-1 flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#78909C] mb-2 px-1">
            Spice Groups
          </h3>
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#6b9312] border-[#6b9312] text-white shadow-md"
                    : "bg-white border-[#f0e8dc] text-[#37474F] hover:bg-[#F5F5F5]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag size={18} className={isSelected ? "text-white" : "text-[#78909C]"} />
                  <span className="font-medium text-sm sm:text-base">{cat}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#faf7f2] text-[#8c6239]"
                  }`}
                >
                  {count} {count === 1 ? "Product" : "Products"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Products under selected category */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-[#f0e8dc] bg-white p-6 shadow-sm min-h-[400px]">
            <div className="border-b border-[#ECEFF1] pb-4 mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#263238]">
                {selectedCategory || "No Category Selected"}
              </h3>
              <span className="text-sm text-[#78909C]">
                {categoryProducts.length} items found
              </span>
            </div>

            {categoryProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#78909C]">
                <Package size={48} strokeWidth={1.5} className="mb-3 text-[#B0BEC5]" />
                <p className="text-sm">No products in this category yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#ECEFF1] text-xs uppercase tracking-wide text-[#78909C]">
                      <th className="py-2.5 pr-4 font-semibold">SKU</th>
                      <th className="py-2.5 pr-4 font-semibold">Product Name</th>
                      <th className="py-2.5 pr-4 font-semibold">Origin</th>
                      <th className="py-2.5 pr-4 font-semibold text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProducts.map((p) => (
                      <tr key={p._id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] text-[#37474F]">
                        <td className="py-3 pr-4 font-mono text-xs text-[#8c6239]">
                          {p.sku}
                        </td>
                        <td className="py-3 pr-4 font-medium">{p.name}</td>
                        <td className="py-3 pr-4 text-xs text-[#78909C]">{p.origin}</td>
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

      {/* Add Category Modal */}
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
    </div>
  );
};

export default AdminCategoryPanel;
