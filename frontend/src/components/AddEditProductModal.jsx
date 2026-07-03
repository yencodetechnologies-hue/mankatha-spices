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

const generateBarcode = () => Math.floor(100000 + Math.random() * 900000).toString();

const emptyProduct = {
  type: "General",
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
  if (firstWeightStr.includes("nos") || firstWeightStr.includes("no") || firstWeightStr.includes("piece") || firstWeightStr.includes("pcs")) {
    return "nos";
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
      type: initialData.type ?? "General",
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
    } catch (_) { }
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
            original_price: w.original_price || "",
            barcode: w.barcode || generateBarcode()
          }))
        );
      } else {
        setCustomWeights([
          { id: 1, weight: "100g", price: "", original_price: "", barcode: generateBarcode() },
          { id: 2, weight: "250g", price: "", original_price: "", barcode: generateBarcode() },
          { id: 3, weight: "500g", price: "", original_price: "", barcode: generateBarcode() },
          { id: 4, weight: "1kg", price: "", original_price: "", barcode: generateBarcode() }
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
          barcode: w.barcode?.trim() || "",
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
            <div className="form-group">
              <label>Distributor</label>
              <input
                type="text"
                placeholder="Distributor"
                value={form.type || "General"}
                onChange={(e) => setField("type", e.target.value)}
                required
              />
            </div>

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
                        mg_g: ["100mg", "250mg", "500mg", "1g"],
                        nos: ["1 nos", "2 nos", "5 nos", "10 nos"]
                      };
                      const items = defaults[newSys] || defaults.g_kg;
                      setCustomWeights(items.map((w, idx) => ({ id: idx, weight: w, price: "", original_price: "", barcode: generateBarcode() })));
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
                    <option value="nos">Numbers/Pieces (nos)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomWeights([
                        ...customWeights,
                        { id: Date.now() + Math.random(), weight: "", price: "", original_price: "", barcode: generateBarcode() }
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.6rem", alignItems: "end" }}>
                        {/* Column Headers */}
                        <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", paddingLeft: "0.25rem" }}>Weight</div>
                        <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", paddingLeft: "0.25rem" }}>Price</div>
                        <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", paddingLeft: "0.25rem" }}>Barcode</div>
                        <div></div>

                        {/* Weight Input */}
                        <input
                          type="text"
                          placeholder="e.g. 100g"
                          value={w.weight}
                          onChange={(e) => {
                            const updated = [...customWeights];
                            updated[index].weight = e.target.value;
                            setCustomWeights(updated);
                          }}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            border: "1px solid #d7dce8",
                            borderRadius: "4px",
                            margin: 0
                          }}
                          required
                        />

                        {/* Price Input */}
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
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            border: "1px solid #d7dce8",
                            borderRadius: "4px",
                            margin: 0
                          }}
                          required
                          min="0"
                        />

                        {/* Barcode Input */}
                        <input
                          type="text"
                          placeholder="Barcode"
                          title="Barcode"
                          value={w.barcode || ""}
                          onChange={(e) => {
                            const updated = [...customWeights];
                            updated[index].barcode = e.target.value;
                            setCustomWeights(updated);
                          }}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                            border: "1px solid #d7dce8",
                            borderRadius: "4px",
                            margin: 0
                          }}
                        />

                        {/* Delete Button */}
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




          </div>



          <div className="form-group">
            <label style={{ fontWeight: "600" }}>Product Image</label>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <label 
                className="upload-dropzone" 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  border: "2px dashed #ede6dc", 
                  borderRadius: "10px", 
                  cursor: "pointer", 
                  background: (form.image || (initialData && initialData.image)) ? "#fff" : "#fcfcf9",
                  position: "relative",
                  overflow: "hidden",
                  padding: (form.image || (initialData && initialData.image)) ? "0" : "2rem",
                  width: "100%",
                  maxWidth: "400px",
                  minHeight: "120px",
                  transition: "all 0.2s ease"
                }}
              >
                <input type="file" accept="image/*" onChange={(e) => setField("image", e.target.files?.[0] || null)} style={{ display: "none" }} />
                
                {(form.image || (initialData && initialData.image)) ? (
                  <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img
                      src={form.image ? URL.createObjectURL(form.image) : absoluteImage(initialData.image)}
                      alt="Product preview"
                      style={{ 
                        width: "100%",
                        height: "auto",
                        maxHeight: "300px", 
                        objectFit: "contain", 
                        display: "block" 
                      }}
                    />
                    <div 
                      style={{ 
                        position: "absolute", 
                        inset: 0, 
                        background: "rgba(0,0,0,0.5)", 
                        opacity: 0, 
                        transition: "opacity 0.2s ease", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        color: "#fff", 
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }} 
                      onMouseEnter={e => e.currentTarget.style.opacity = 1} 
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                      <Camera size={18} style={{ marginRight: "6px" }} /> Change Image
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera size={28} style={{ color: "#8dbe20", marginBottom: "0.75rem" }} />
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#374151" }}>
                      Click to upload image
                    </span>
                    <small style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.4rem" }}>PNG, JPG up to 5MB</small>
                  </>
                )}
              </label>

              {(form.image || (initialData && initialData.image)) && (
                <button
                  type="button"
                  onClick={() => setField("image", null)}
                  style={{ 
                    marginTop: "0.75rem", 
                    fontSize: "0.85rem", 
                    color: "#ef4444", 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    fontWeight: "500", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.3rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <Trash2 size={16} /> Remove Image
                </button>
              )}
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
