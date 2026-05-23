import React, { useMemo, useState } from "react";
import { Camera, X, Check, Plus, Trash2 } from "lucide-react";
import { categoryApi } from "../api/categoryApi";
import { getBackendOrigin } from "../api/adminApiBase";

const absoluteImage = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getBackendOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
};

const emptyProduct = {
  type: "general",
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
  vatPercent: 0,
  dietaryPreference: "",
  image: null,
  pricing: [],
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
        weightsMap[w.weight] = { enabled: true, price: w.price, original_price: w.original_price || "" };
      });
    }

    return {
      ...initialData,
      type: initialData.type ?? "general",
      image: null,
      price: firstWeightPricing?.price ?? 1,
      weight: firstWeightPricing?.weight ?? "100g",
      pricing: initialData.pricing?.length ? initialData.pricing : [],
      reorderQty: initialData.reorderQty ?? 100,
      supplier: initialData.supplier ?? "",
      barcode: initialData.barcode ?? "",
      vatPercent: initialData.vatPercent ?? 0,
      dietaryPreference: initialData.dietaryPreference ?? "",
      weightsMap,
    };
  }, [initialData]);

  const [unitSystem, setUnitSystem] = useState(() => {
    const firstCountryPricing = initialData?.pricing?.[0];
    return getUnitSystemFromWeights(firstCountryPricing?.weights || []);
  });

  const [form, setForm] = useState(seedData);
  const [categories, setCategories] = useState([]);
  const [customWeights, setCustomWeights] = useState([]);
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
    
    if (isOpen) {
      if (firstCountryPricing?.weights && firstCountryPricing.weights.length > 0) {
        setCustomWeights(
          firstCountryPricing.weights.map((w, idx) => ({
            id: idx,
            weight: w.weight || "",
            price: w.price || "",
            original_price: w.original_price || ""
          }))
        );
      } else {
        setCustomWeights([
          { id: 1, weight: "100g", price: "", original_price: "" },
          { id: 2, weight: "250g", price: "", original_price: "" },
          { id: 3, weight: "500g", price: "", original_price: "" },
          { id: 4, weight: "1kg", price: "", original_price: "" }
        ]);
      }
    }
  }, [seedData, isOpen]);

  if (!isOpen) return null;

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = (e) => {
    e.preventDefault();
    const activeWeights = customWeights
      .filter((w) => w.weight.trim() !== "" && w.price !== "")
      .map((w) => {
        const item = {
          weight: w.weight.trim(),
          price: Number(w.price),
        };
        if (w.original_price && Number(w.original_price) > Number(w.price)) {
          item.original_price = Number(w.original_price);
        }
        return item;
      });

    if (activeWeights.length === 0) {
      alert("Please add and price at least one weight option.");
      return;
    }

    const payload = {
      ...form,
      pricing: [
        {
          country: "United Kingdom",
          currency: "GBP",
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
            {/* 
            <div className="form-group">
              <label>Product Type</label>
              <select value={form.type || "general"} onChange={(e) => setField("type", e.target.value)} required>
                <option value="general">General</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            */}

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
              <input placeholder="e.g. London, UK" value={form.origin} onChange={(e) => setField("origin", e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" placeholder="0" value={form.stock} onChange={(e) => setField("stock", Number(e.target.value))} required />
            </div>

            <div className="form-group">
              <label>VAT (%)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={form.vatPercent ?? 0}
                min="0"
                max="100"
                step="0.01"
                onChange={(e) => setField("vatPercent", e.target.value === "" ? 0 : Number(e.target.value))}
              />
              {Number(form.vatPercent) > 0 && (
                <small style={{ color: "#6b7280", marginTop: "0.25rem", display: "block" }}>
                  VAT amount will be shown per weight option below.
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Dietary Preference</label>
              <select
                value={form.dietaryPreference || ""}
                onChange={(e) => setField("dietaryPreference", e.target.value)}
                required
              >
                <option value="" disabled hidden>Select...</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ margin: 0, fontWeight: "600" }}>Weight Options & Prices</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <select
                    value={unitSystem}
                    onChange={(e) => {
                      const newSys = e.target.value;
                      setUnitSystem(newSys);
                      const defaults = {
                        g_kg: ["100g", "250g", "500g", "1kg"],
                        ml_l: ["100ml", "250ml", "500ml", "1l"],
                        mg_g: ["100mg", "250mg", "500mg", "1g"]
                      };
                      const items = defaults[newSys] || defaults.g_kg;
                      setCustomWeights(items.map((w, idx) => ({ id: idx, weight: w, price: "", original_price: "" })));
                    }}
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
                  <button
                    type="button"
                    onClick={() => {
                      setCustomWeights([
                        ...customWeights,
                        { id: Date.now() + Math.random(), weight: "", price: "", original_price: "" }
                      ]);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-xs font-semibold"
                    style={{ border: "none", cursor: "pointer", outline: "none" }}
                  >
                    <Plus size={14} /> Add Weight Option
                  </button>
                </div>
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                background: "#faf7f2",
                border: "1px solid #ede6dc",
                padding: "1rem",
                borderRadius: "10px"
              }}>
                {customWeights.map((w, index) => {
                  const basePrice = Number(w.price) || 0;
                  const vatAmt = basePrice > 0 && Number(form.vatPercent) > 0
                    ? ((basePrice * Number(form.vatPercent)) / 100).toFixed(2)
                    : null;
                  return (
                    <div key={w.id || index} style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem",
                      background: "#fff",
                      border: "1px solid #ede6dc",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        {/* Weight (Grams/kg/etc) */}
                        <input
                          type="text"
                          placeholder="Weight (e.g. 100g)"
                          value={w.weight}
                          onChange={(e) => {
                            const updated = [...customWeights];
                            updated[index].weight = e.target.value;
                            setCustomWeights(updated);
                          }}
                          style={{
                            flex: "1 1 120px",
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            border: "1px solid #d7dce8",
                            borderRadius: "4px",
                            margin: 0
                          }}
                          required
                        />

                        {/* Price */}
                        <input
                          type="number"
                          placeholder="Price"
                          title="Selling Price"
                          value={w.price}
                          onChange={(e) => {
                            const updated = [...customWeights];
                            updated[index].price = e.target.value === "" ? "" : Number(e.target.value);
                            setCustomWeights(updated);
                          }}
                          style={{
                            flex: "1 1 100px",
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            border: "1px solid #d7dce8",
                            borderRadius: "4px",
                            margin: 0
                          }}
                          required
                          min="0"
                        />

                        {/* MRP Strike Price */}
                        <input
                          type="number"
                          placeholder="MRP"
                          title="Maximum Retail Price (Strike Price)"
                          value={w.original_price || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            const updated = [...customWeights];
                            updated[index].original_price = val;
                            setCustomWeights(updated);
                          }}
                          style={{
                            flex: "0 0 90px",
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            border: w.original_price && Number(w.original_price) > Number(w.price)
                              ? "1.5px solid #8dbe20"
                              : "1px solid #d7dce8",
                            borderRadius: "4px",
                            margin: 0
                          }}
                          min="0"
                        />

                        {/* Delete Row Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (customWeights.length > 1) {
                              setCustomWeights(customWeights.filter((_, idx) => idx !== index));
                            } else {
                              alert("Must have at least one weight option.");
                            }
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}
                          title="Delete weight option"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Show derived discount % */}
                      {Number(w.original_price) > Number(w.price) && Number(w.price) > 0 && (
                        <div style={{ fontSize: "0.75rem", color: "#8dbe20", fontWeight: "600", paddingLeft: "0.25rem" }}>
                          Discount: {Math.round(((Number(w.original_price) - Number(w.price)) / Number(w.original_price)) * 100)}% OFF
                        </div>
                      )}

                      {vatAmt && (
                        <div style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          paddingLeft: "0.25rem",
                          display: "flex",
                          gap: "0.5rem"
                        }}>
                          <span>VAT ({form.vatPercent}%): <strong style={{ color: "#b45309" }}>+{vatAmt}</strong></span>
                          <span style={{ color: "#374151" }}>→ Total: <strong>{(basePrice + Number(vatAmt)).toFixed(2)}</strong></span>
                        </div>
                      )}
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
            <label style={{ fontWeight: "600" }}>Product Image</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {(form.image || (initialData && initialData.image)) && (
                <div style={{ position: "relative", width: "90px", height: "90px", borderRadius: "10px", overflow: "hidden", border: "1px solid #ede6dc", flexShrink: 0 }}>
                  <img
                    src={form.image ? URL.createObjectURL(form.image) : absoluteImage(initialData.image)}
                    alt="Product preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setField("image", null);
                    }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "rgba(220, 38, 38, 0.85)",
                      color: "#white",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0
                    }}
                    title="Remove selected file"
                  >
                    <X size={12} color="#fff" />
                  </button>
                </div>
              )}

              <label className="upload-dropzone" style={{ flex: 1, margin: 0, height: "90px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px dashed #ede6dc", borderRadius: "10px", cursor: "pointer", background: "#fcfcf9" }}>
                <input type="file" accept="image/*" onChange={(e) => setField("image", e.target.files?.[0] || null)} style={{ display: "none" }} />
                <Camera size={20} style={{ color: "#8dbe20", marginBottom: "0.25rem" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                  {form.image ? "Change selected image" : (initialData && initialData.image ? "Change existing image" : "Click to upload image")}
                </span>
                <small style={{ fontSize: "0.75rem", color: "#9ca3af" }}>PNG, JPG up to 5MB</small>
                {form.image && <em style={{ fontSize: "0.7rem", color: "#8dbe20", marginTop: "0.25rem" }}>{form.image.name}</em>}
              </label>
            </div>
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
