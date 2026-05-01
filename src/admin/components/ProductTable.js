import React from "react";
import { getStockStatus, resolvePriceByCountryAndWeight } from "../utils/pricing";

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
            const pricing = resolvePriceByCountryAndWeight(product, selectedCountry, selectedWeight);
            const status = getStockStatus(product.stock, product.minStock);

            return (
              <tr key={product._id}>
                <td>
                  <div className="product-name-cell">
                    <strong>{product.name}</strong>
                    <span>SKU: {product.sku}</span>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{pricing ? `${pricing.symbol} ${pricing.price}` : "--"}</td>
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
