import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProductTable from "../components/ProductTable";
import AddEditProductModal from "../components/AddEditProductModal";
import { productApi } from "../api/productApi";
import { COUNTRY_OPTIONS } from "../constants";
import { Search } from "lucide-react";
import "../admin.css";

const PAGE_SIZE = 6;

const AdminPanelPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_OPTIONS[0].country);
  const [selectedWeight, setSelectedWeight] = useState("100g");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await productApi.getProducts();
      setProducts(data.products || []);
    } catch (error) {
      setErrorMessage("Cannot connect to API. Please start backend server on http://localhost:5000.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const enrichedProducts = useMemo(
    () =>
      products.map((p) => {
        const status = p.stock <= 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "Active";
        return { ...p, status };
      }),
    [products]
  );

  const categories = useMemo(() => ["All", ...new Set(enrichedProducts.map((p) => p.category))], [enrichedProducts]);
  const activeCount = useMemo(() => enrichedProducts.filter((item) => item.status === "Active").length, [enrichedProducts]);
  const outOfStockCount = useMemo(
    () => enrichedProducts.filter((item) => item.status === "Out of Stock").length,
    [enrichedProducts]
  );

  const filtered = useMemo(() => {
    return enrichedProducts
      .filter((p) => (categoryFilter === "All" ? true : p.category === categoryFilter))
      .filter((p) => (stockFilter === "All" ? true : p.status === stockFilter))
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  }, [enrichedProducts, categoryFilter, stockFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const buildProductFormData = (product) => {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("sku", product.sku);
    formData.append("category", product.category);
    formData.append("origin", product.origin);
    formData.append("description", product.description);
    formData.append("stock", String(product.stock));
    formData.append("minStock", String(product.minStock));
    formData.append("pricing", JSON.stringify(product.pricing));
    if (product.image) formData.append("image", product.image);
    return formData;
  };

  const handleSubmitProduct = async (product) => {
    try {
      setErrorMessage("");
      const formData = buildProductFormData(product);
      if (editProduct?._id) {
        await productApi.updateProduct(editProduct._id, formData);
      } else {
        await productApi.createProduct(formData);
      }
      setModalOpen(false);
      setEditProduct(null);
      await fetchProducts();
    } catch (error) {
      setErrorMessage("Product save failed. Please verify backend is running and try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      setErrorMessage("");
      await productApi.deleteProduct(id);
      await fetchProducts();
    } catch (error) {
      setErrorMessage("Delete failed. Please verify backend connection and try again.");
    }
  };

  return (
    <AdminLayout>
      <div className="products-head">
        <div>
          <h2>Products</h2>
          <p>
            {activeCount} active products · {outOfStockCount} out of stock
          </p>
        </div>
        <button
          type="button"
          className="top-add-btn"
          onClick={() => {
            setEditProduct(null);
            setModalOpen(true);
          }}
        >
          + Add New Product
        </button>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>

      {errorMessage && (
        <div className="status-error" role="alert">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="status-info">Loading products...</div>
      ) : (
        <>
          <ProductTable
            products={pagedProducts}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedWeight={selectedWeight}
            setSelectedWeight={setSelectedWeight}
            onEdit={(product) => {
              setEditProduct(product);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />

          <div className="pager">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              return (
                <button
                  type="button"
                  key={pageNumber}
                  className={pageNumber === page ? "page-chip active" : "page-chip"}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button type="button" className="page-chip" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              →
            </button>
          </div>
        </>
      )}

      <AddEditProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditProduct(null);
        }}
        onSubmit={handleSubmitProduct}
        initialData={editProduct}
      />
    </AdminLayout>
  );
};

export default AdminPanelPage;
