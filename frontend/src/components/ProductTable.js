import { getStockStatus } from "../utils/pricing";

const ProductTable = ({
  products,
  selectedCountry,
  setSelectedCountry,
  selectedWeight,
  setSelectedWeight,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Sales</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = getStockStatus(product.stock, product.minStock);

            const getPricesDisplay = () => {
              const countryPricing = product?.pricing?.find((entry) => entry.country === selectedCountry) || product?.pricing?.[0];
              if (!countryPricing || !countryPricing.weights || countryPricing.weights.length === 0) return "--";
              
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {countryPricing.weights.map((w) => (
                    <div key={w.weight} style={{ fontSize: "0.8rem", whiteSpace: "nowrap", color: "#3d2f26" }}>
                      <span style={{ fontWeight: "600" }}>{w.weight}:</span> LKR {w.price}
                    </div>
                  ))}
                </div>
              );
            };

            return (
              <tr key={product._id}>
                <td>
                  <div className="product-name-cell">
                    <strong>{product.name}</strong>
                    <span>SKU: {product.sku}</span>
                    {product.barcode && (
                      <span style={{ fontSize: "0.72rem", color: "#8B5E3C", display: "block", marginTop: "2px" }}>
                        Barcode: {product.barcode}
                      </span>
                    )}
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{getPricesDisplay()}</td>
                <td className={product.stock <= product.minStock ? "stock-alert" : "stock-ok"}>{product.stock} units</td>
                <td>{product.sales || 0} sold</td>
                <td>
                  <span className={`status-pill ${status.toLowerCase().replace(/\s/g, "-")}`}>{status}</span>
                </td>
                <td className="actions-inline">
                  <button type="button" onClick={() => onEdit(product)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(product._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
