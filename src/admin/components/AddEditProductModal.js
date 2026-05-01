import React, { useMemo, useState } from "react";
import { Camera, X } from "lucide-react";
import { CATEGORY_OPTIONS } from "../constants";

const emptyProduct = {
  name: "",
  sku: "",
  category: CATEGORY_OPTIONS[0],
  origin: "",
  description: "",
  price: 1,
  weight: "100g",
  stock: 0,
  minStock: 0,
  image: null,
  pricing: [],
};

const AddEditProductModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const seedData = useMemo(() => {
    if (!initialData) return emptyProduct;
    const firstCountryPricing = initialData.pricing?.[0];
    const firstWeightPricing = firstCountryPricing?.weights?.[0];
    return {
      ...initialData,
      image: null,
      price: firstWeightPricing?.price ?? 1,
      weight: firstWeightPricing?.weight ?? "100g",
      pricing: initialData.pricing?.length ? initialData.pricing : [],
    };
  }, [initialData]);

  const [form, setForm] = useState(seedData);

  React.useEffect(() => {
    setForm(seedData);
  }, [seedData, isOpen]);

  if (!isOpen) return null;

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      pricing: [
        {
          country: "India",
          currency: "INR",
          weights: [{ weight: form.weight, price: Number(form.price) }],
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
              <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Origin</label>
              <input placeholder="e.g. Kashmir, India" value={form.origin} onChange={(e) => setField("origin", e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" placeholder="0" value={form.stock} onChange={(e) => setField("stock", Number(e.target.value))} required />
            </div>

            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" placeholder="1" value={form.price} onChange={(e) => setField("price", Number(e.target.value))} required />
            </div>

            <div className="form-group">
              <label>Weight</label>
              <input placeholder="e.g. 100g" value={form.weight} onChange={(e) => setField("weight", e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Min. Stock Alert</label>
              <input type="number" placeholder="50" value={form.minStock} onChange={(e) => setField("minStock", Number(e.target.value))} required />
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
