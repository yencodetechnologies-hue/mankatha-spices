import React, { useMemo, useState } from "react";
import { Camera, X, Check } from "lucide-react";
import { categoryApi } from "../api/categoryApi";

const emptyProduct = {
  name: "",
  sku: "",
  category: "",
  origin: "",
  description: "",
  price: 1,
  weight: "100g",
  stock: 0,
  minStock: 0,
  reorderQty: 100,
  supplier: "",
  barcode: "",
  image: null,
  pricing: [],
};

const UNIT_OPTIONS_MAP = {
  g_kg: ["100g", "250g", "500g", "1kg"],
  ml_l: ["100ml", "250ml", "500ml", "1l"],
  mg_g: ["100mg", "250mg", "500mg", "1g"],
};

const getUnitSystemFromWeights = (weights = []) => {
  if (!weights.length) return "g_kg";
  const firstWeightStr = weights[0].weight?.toLowerCase() || "";
  if (firstWeightStr.endsWith("mg")) return "mg_g";
  if (firstWeightStr.endsWith("ml") || firstWeightStr.endsWith("l") || firstWeightStr.endsWith("liter")) {
    return "ml_l";
  }
  return "g_kg";
};

const AddEditProductModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const seedData = useMemo(() => {
    if (!initialData) {
      return {
        ...emptyProduct,
        weightsMap: {}
      };
    }
    const firstCountryPricing = initialData.pricing?.[0];
    const firstWeightPricing = firstCountryPricing?.weights?.[0];
    
    const weightsMap = {};
    if (firstCountryPricing?.weights) {
      firstCountryPricing.weights.forEach(w => {
        weightsMap[w.weight] = { enabled: true, price: w.price };
      });
    }

    return {
      ...initialData,
      image: null,
      price: firstWeightPricing?.price ?? 1,
      weight: firstWeightPricing?.weight ?? "100g",
      pricing: initialData.pricing?.length ? initialData.pricing : [],
      reorderQty: initialData.reorderQty ?? 100,
      supplier: initialData.supplier ?? "",
      barcode: initialData.barcode ?? "",
      weightsMap,
    };
  }, [initialData]);

  const [unitSystem, setUnitSystem] = useState(() => {
    const firstCountryPricing = initialData?.pricing?.[0];
    return getUnitSystemFromWeights(firstCountryPricing?.weights || []);
  });

  const [form, setForm] = useState(seedData);
  const [categories, setCategories] = useState([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catError, setCatError] = useState("");
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (addingCategory && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingCategory]);

  const handleInlineSaveCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await categoryApi.create(newCatName.trim());
      const freshName = newCatName.trim();
      setNewCatName("");
      setAddingCategory(false);
      const res = await categoryApi.list();
      const list = (res.categories || []).map((c) => c.name);
      setCategories(list);
      setField("category", freshName);
    } catch (err) {
      setCatError(err.response?.data?.message || "Failed to create");
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryApi.list();
      const list = (res.categories || []).map((c) => c.name);
      setCategories(list);
    } catch (_) {}
  };

  React.useEffect(() => {
    if (isOpen) {
      loadCategories();
      setAddingCategory(false);
      setNewCatName("");
      setCatError("");
    }
  }, [isOpen]);

  React.useEffect(() => {
    setForm(seedData);
    const firstCountryPricing = seedData.pricing?.[0];
    setUnitSystem(getUnitSystemFromWeights(firstCountryPricing?.weights || []));
  }, [seedData, isOpen]);

  if (!isOpen) return null;

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = (e) => {
    e.preventDefault();
    const currentOptions = UNIT_OPTIONS_MAP[unitSystem] || UNIT_OPTIONS_MAP.g_kg;
    const activeWeights = Object.entries(form.weightsMap || {})
      .filter(([weightName, item]) => currentOptions.includes(weightName) && item.enabled && item.price !== "")
      .map(([weightName, item]) => ({
        weight: weightName,
        price: Number(item.price),
      }));

    if (activeWeights.length === 0) {
      alert("Please select and price at least one weight option.");
      return;
    }

    const payload = {
      ...form,
      pricing: [
        {
          country: "Sri Lanka",
          currency: "LKR",
          weights: activeWeights,
        },
      ],
    };
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{initialData ? "Edit Product" : "Add New Product"}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div className="grid-2">
            <div className="form-group">
              <label>Product Name</label>
              <input placeholder="e.g. Kashmir Saffron" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            </div>

            <div className="form-group">
              <label>SKU</label>
              <input placeholder="SE-XXX-001" value={form.sku} onChange={(e) => setField("sku", e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Category</label>
              {addingCategory ? (
                <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", width: "100%" }}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type name & press Enter or checkmark"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setCatError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleInlineSaveCategory();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setAddingCategory(false);
                      }
                    }}
                    className="flex-1"
                    style={{ margin: 0 }}
                  />
                  <button
                    type="button"
                    onClick={handleInlineSaveCategory}
                    className="save-cat-btn"
                    title="Save Category"
                    style={{
                      border: "none",
                      background: "#4CAF50",
                      color: "white",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "none",
                      width: "36px",
                      height: "36px"
                    }}
                  >
                    <Check size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingCategory(false)}
                    className="cancel-cat-btn"
                    title="Cancel"
                    style={{
                      border: "none",
                      background: "#e0e0e0",
                      color: "#333",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "none",
                      width: "36px",
                      height: "36px"
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <select
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === "__ADD_NEW__") {
                      setAddingCategory(true);
                      setNewCatName("");
                      setCatError("");
                    } else {
                      setField("category", e.target.value);
                    }
                  }}
                  required
                >
                  <option value="" hidden></option>
                  <option value="__ADD_NEW__" style={{ backgroundColor: "#1976d2", color: "#ffffff", fontWeight: "bold" }}>
                    + Add Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
              {catError && <p className="text-xs text-red-500 mt-1">{catError}</p>}
            </div>

            <div className="form-group">
              <label>Origin</label>
              <input placeholder="e.g. Matale, Sri Lanka" value={form.origin} onChange={(e) => setField("origin", e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" placeholder="0" value={form.stock} onChange={(e) => setField("stock", Number(e.target.value))} required />
            </div>

            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ margin: 0 }}>Weight Options & Prices</label>
                <select
                  value={unitSystem}
                  onChange={(e) => setUnitSystem(e.target.value)}
                  style={{
                    width: "auto",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.85rem",
                    borderRadius: "6px",
                    border: "1px solid #f2c9a6",
                    background: "#fff",
                    cursor: "pointer"
                  }}
                >
                  <option value="g_kg">Solid (g, kg)</option>
                  <option value="ml_l">Liquid (ml, l)</option>
                  <option value="mg_g">Milligram (mg, g)</option>
                </select>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                background: "#faf7f2",
                border: "1px solid #ede6dc",
                padding: "1rem",
                borderRadius: "10px"
              }}>
                {(UNIT_OPTIONS_MAP[unitSystem] || UNIT_OPTIONS_MAP.g_kg).map((wt) => {
                  const item = form.weightsMap?.[wt] || { enabled: false, price: "" };
                  return (
                    <div key={wt} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      background: "#fff",
                      border: "1px solid #ede6dc",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px"
                    }}>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...form.weightsMap,
                            [wt]: { ...item, enabled: e.target.checked }
                          };
                          setField("weightsMap", updated);
                        }}
                        style={{ cursor: "pointer", width: "auto", margin: 0 }}
                      />
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", width: "50px", color: "#3d2f26" }}>{wt}</span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        disabled={!item.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...form.weightsMap,
                            [wt]: { ...item, price: e.target.value === "" ? "" : Number(e.target.value) }
                          };
                          setField("weightsMap", updated);
                        }}
                        style={{
                          flex: 1,
                          fontSize: "0.85rem",
                          padding: "0.25rem 0.5rem",
                          border: "1px solid #d7dce8",
                          borderRadius: "4px",
                          margin: 0
                        }}
                        required={item.enabled}
                        min="0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Min. Stock Alert</label>
              <input type="number" placeholder="50" value={form.minStock} onChange={(e) => setField("minStock", Number(e.target.value))} required />
            </div>

            <div className="form-group">
              <label>Reorder qty</label>
              <input
                type="number"
                min={0}
                placeholder="200"
                value={form.reorderQty}
                onChange={(e) => setField("reorderQty", Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <input placeholder="e.g. Kashmir Valley Co." value={form.supplier} onChange={(e) => setField("supplier", e.target.value)} />
            </div>

            <div className="form-group">
              <label>Barcode / QR Code</label>
              <input placeholder="e.g. 88010972..." value={form.barcode || ""} onChange={(e) => setField("barcode", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe the spice origin, quality, aroma, taste notes..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <label className="upload-dropzone">
              <input type="file" accept="image/*" onChange={(e) => setField("image", e.target.files?.[0] || null)} />
              <Camera size={28} />
              <span>Click to upload or drag and drop</span>
              <small>PNG, JPG up to 5MB</small>
              {form.image && <em>{form.image.name}</em>}
            </label>
          </div>

          <div className="actions-row modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {initialData ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProductModal;
