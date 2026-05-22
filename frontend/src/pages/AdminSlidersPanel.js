import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import heroBlendedMasala from "../assets/hero_blended_masala.png";
import heroOrganicSpices from "../assets/hero_organic_spices.png";
import heroWholeSpices from "../assets/hero_whole_spices.png";

const AdminSlidersPanel = () => {
  const [sliders, setSliders] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "", link: "", isActive: true });

  useEffect(() => {
    const saved = localStorage.getItem("mankatha_sliders_v2");
    if (saved) {
      setSliders(JSON.parse(saved));
    } else {
      // Add the 3 default sliders if empty
      const defaultInitial = [
        { id: "1", title: "Mankatha Blended Masalas", imageUrl: heroBlendedMasala, link: "/products", isActive: true },
        { id: "2", title: "Pure & Organic Spices", imageUrl: heroOrganicSpices, link: "/products", isActive: true },
        { id: "3", title: "Traditional Whole Spices", imageUrl: heroWholeSpices, link: "/products", isActive: true }
      ];
      setSliders(defaultInitial);
      localStorage.setItem("mankatha_sliders_v2", JSON.stringify(defaultInitial));
    }
  }, []);

  useEffect(() => {
    if (sliders.length > 0) {
      localStorage.setItem("mankatha_sliders_v2", JSON.stringify(sliders));
    }
  }, [sliders]);

  const handleOpenModal = (slider = null) => {
    if (slider) {
      setEditingSlider(slider);
      setFormData(slider);
    } else {
      setEditingSlider(null);
      setFormData({ title: "", imageUrl: "", isActive: true });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingSlider) {
      setSliders(sliders.map(s => s.id === editingSlider.id ? { ...formData, id: s.id } : s));
    } else {
      setSliders([...sliders, { ...formData, id: Date.now().toString() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this slider?")) {
      const updated = sliders.filter(s => s.id !== id);
      setSliders(updated);
      if (updated.length === 0) {
        localStorage.removeItem("mankatha_sliders_v2");
      }
    }
  };

  const filtered = sliders.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="products-head">
        <div>
          <h2>Sliders</h2>
          <p>{sliders.length} total sliders</p>
        </div>
        <button type="button" className="top-add-btn" onClick={() => handleOpenModal()}>
          + Add Slider
        </button>
      </div>

      <div className="orders-table-card">
        <div className="orders-toolbar">
          <div className="search-field orders-search">
            <Search size={16} />
            <input
              className="search-input"
              placeholder="Search sliders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="orders-empty-cell">No sliders found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <img src={s.imageUrl} alt={s.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td style={{ fontWeight: '600' }}>{s.title}</td>
                    <td>
                      <span className={`order-pill ${s.isActive ? 'status-delivered' : 'status-cancelled'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" className="order-view-btn" onClick={() => handleOpenModal(s)}>
                          Edit
                        </button>
                        <button type="button" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }} onClick={() => handleDelete(s.id)}>
                          Delete
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{editingSlider ? 'Edit Slider' : 'Add New Slider'}</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: '14px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Slider Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  placeholder="e.g. Summer Spice Sale"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Slider Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ cursor: 'pointer', padding: '8px 16px', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', display: 'inline-block' }}>
                    {formData.imageUrl ? 'Change Image' : 'Choose Image'}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, imageUrl: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {formData.imageUrl && <span style={{ fontSize: '13px', color: '#6b9312', fontWeight: '600' }}>✓ Image Ready</span>}
                </div>
                {formData.imageUrl && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Preview:</p>
                    <img src={formData.imageUrl} alt="Preview" style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }} />
                  </div>
                )}
              </div>

          

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#6b9312' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>Active on Homepage</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', color: '#374151', fontWeight: '500', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                disabled={!formData.title || !formData.imageUrl}
                onClick={handleSave}
                style={{ padding: '10px 16px', background: '#6b9312', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '500', cursor: 'pointer', opacity: (!formData.title || !formData.imageUrl) ? 0.7 : 1 }}
              >
                Save Slider
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSlidersPanel;
