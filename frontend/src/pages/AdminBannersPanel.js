import React, { useState, useEffect } from "react";
import promoBannerImg from "../assets/promo_banner.png";

const AdminBannersPanel = () => {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    imageType: "upload", // 'upload' or 'url'
    imageUrl: "",
    imageFile: null
  });

  useEffect(() => {
    const saved = localStorage.getItem("mankatha_promo_banners");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setBanners(parsed);
      } else {
        const defaultBanner = {
          id: "1",
          title: "Up to 40% OFF",
          link: "/products",
          imageType: "url",
          imageUrl: promoBannerImg,
          imageFile: null,
          isActive: true
        };
        setBanners([defaultBanner]);
        localStorage.setItem("mankatha_promo_banners", JSON.stringify([defaultBanner]));
      }
    } else {
      const defaultBanner = {
        id: "1",
        title: "Up to 40% OFF",
        link: "/products",
        imageType: "url",
        imageUrl: promoBannerImg,
        imageFile: null,
        isActive: true
      };
      setBanners([defaultBanner]);
      localStorage.setItem("mankatha_promo_banners", JSON.stringify([defaultBanner]));
    }
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData(banner);
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        link: "",
        imageType: "upload",
        imageUrl: "",
        imageFile: null
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    let updatedBanners;
    if (editingBanner) {
      updatedBanners = banners.map(b => b.id === editingBanner.id ? { ...formData, isActive: true, id: b.id } : b);
    } else {
      updatedBanners = [...banners, { ...formData, isActive: true, id: Date.now().toString() }];
    }
    setBanners(updatedBanners);
    localStorage.setItem("mankatha_promo_banners", JSON.stringify(updatedBanners));
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this promotional banner?")) {
      const updated = banners.filter(b => b.id !== id);
      setBanners(updated);
      localStorage.setItem("mankatha_promo_banners", JSON.stringify(updated));
    }
  };

  return (
    <>
      <div className="products-head">
        <div>
          <h2>Promotional Banners</h2>
          <p>Manage the promotional banners that appear on the homepage.</p>
        </div>
        <button type="button" className="top-add-btn" onClick={() => handleOpenModal()}>
          + Add Promo Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-full orders-table-card p-12 text-center text-gray-500">
            No promotional banners active. Create one to display on the homepage.
          </div>
        ) : (
          banners.map((banner, index) => (
            <div key={banner.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              {/* Banner Preview Image */}
              <div className="relative h-40 w-full bg-gray-100">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                
                {/* Index Badge */}
                <div className="absolute top-3 left-3 bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">
                  {index + 1}
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 bg-gray-800/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {banner.isActive ? 'Active' : 'Hidden'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-700 mb-4">{banner.title || "Untitled Banner"}</h3>
                
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    <button className="px-2 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                    </button>
                    <button className="px-2 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    </button>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => {
                        const updated = banners.map(b => b.id === banner.id ? {...b, isActive: !b.isActive} : b);
                        setBanners(updated);
                        localStorage.setItem("mankatha_promo_banners", JSON.stringify(updated));
                      }}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 text-sm transition-colors"
                    >
                      {banner.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button 
                      onClick={() => handleOpenModal(banner)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-1.5 border border-red-200 rounded-lg text-red-500 font-semibold hover:bg-red-50 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'system-ui, -apple-system, sans-serif' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Add Banner</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                  placeholder="e.g. Sunday classes now open"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Link URL (optional)</label>
                <input 
                  type="text" 
                  value={formData.link} 
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                  placeholder="https://safetytrainingacademy.edu.au/..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '12px' }}>
                  Image <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button 
                    onClick={() => setFormData({...formData, imageType: 'upload'})}
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '6px', 
                      border: formData.imageType === 'upload' ? '1px solid #7c3aed' : '1px solid #e5e7eb',
                      background: formData.imageType === 'upload' ? '#f5f3ff' : '#fff',
                      color: formData.imageType === 'upload' ? '#7c3aed' : '#374151',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Upload
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, imageType: 'url'})}
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '6px', 
                      border: formData.imageType === 'url' ? '1px solid #7c3aed' : '1px solid #e5e7eb',
                      background: formData.imageType === 'url' ? '#f5f3ff' : '#fff',
                      color: formData.imageType === 'url' ? '#7c3aed' : '#111827',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    URL
                  </button>
                </div>

                {formData.imageType === 'upload' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ cursor: 'pointer', padding: '6px 12px', background: '#f9fafb', border: '1px solid #6b7280', borderRadius: '4px', fontSize: '13px', color: '#111827' }}>
                      Choose file
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, imageFile: file, imageUrl: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span style={{ fontSize: '14px', color: formData.imageFile ? '#111827' : '#4b5563' }}>
                      {formData.imageFile ? formData.imageFile.name : 'No file chosen'}
                    </span>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={formData.imageUrl} 
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
                    placeholder="Enter image URL"
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #f3f4f6' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                style={{ padding: '8px 16px', background: '#6366f1', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                Add banner
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBannersPanel;
