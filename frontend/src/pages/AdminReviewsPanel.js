import React, { useCallback, useEffect, useState } from "react";
import { reviewsApi } from "../api/reviewsApi";

const fmtShort = (iso) =>
  new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(new Date(iso));

const initialsFromName = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return String(name || "??")
    .slice(0, 2)
    .toUpperCase();
};

const hueFromName = (name) => {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i += 1) {
    h = s.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
};

const StarRow = ({ rating }) => {
  const r = Math.round(Number(rating) || 0);
  return (
    <div className="reviews-stars" aria-label={`${r} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= r ? "reviews-star on" : "reviews-star"}>
          ★
        </span>
      ))}
      <span className="reviews-star-num">{Number(rating).toFixed(1)}</span>
    </div>
  );
};

const AdminReviewsPanel = () => {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await reviewsApi.getStats();
      setStats(data);
    } catch {
      setStats(null);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const params = statusFilter === "all" ? {} : { status: statusFilter };
      const data = await reviewsApi.getReviews(params);
      setReviews(data.reviews || []);
    } catch (error) {
      const detail = error.response?.data?.message;
      let msg = detail || error.message || "Failed to load reviews.";
      if (error.response?.status === 404) {
        msg =
          "Reviews API endpoint was not found (404). Please verify that the backend server is running and configured correctly.";
      }
      setErrorMessage(msg);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const refreshAll = async () => {
    await Promise.all([loadStats(), loadReviews()]);
  };

  const onApprove = async (id) => {
    try {
      setBusyId(id);
      await reviewsApi.approve(id);
      await refreshAll();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Approve failed.");
    } finally {
      setBusyId(null);
    }
  };

  const onRemove = async (id) => {
    if (!window.confirm("Remove this review permanently?")) return;
    try {
      setBusyId(id);
      await reviewsApi.remove(id);
      await refreshAll();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Remove failed.");
    } finally {
      setBusyId(null);
    }
  };

  const sub =
    stats != null
      ? `${stats.avgRating} avg rating · ${stats.totalReviews.toLocaleString("en-IN")} total reviews · ${stats.pendingModeration} pending moderation`
      : "";

  return (
    <div className="admin-reviews">
      <div className="products-head reviews-head">
        <div>
          <h2>Reviews</h2>
          <p>{sub}</p>
        </div>
        <div className="reviews-toolbar">
          <label className="reviews-filter-label" htmlFor="reviews-status">
            <span className="sr-only">Filter by status</span>
            <select id="reviews-status" className="reviews-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All reviews</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>
      </div>

      {errorMessage ? (
        <div className="status-error" role="alert">
          {errorMessage}
          <button type="button" className="overview-btn-primary overview-retry inv-retry" onClick={() => refreshAll()}>
            Retry
          </button>
        </div>
      ) : null}



      <div className="reviews-table-card">
        <div className="reviews-table-wrap">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => {
                const busy = busyId === r.id;
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="reviews-customer">
                        <span
                          className="reviews-avatar"
                          style={{ background: `hsl(${hueFromName(r.customerName)} 45% 42%)` }}
                          aria-hidden
                        >
                          {initialsFromName(r.customerName)}
                        </span>
                        <span className="reviews-customer-name">{r.customerName}</span>
                      </div>
                    </td>
                    <td className="reviews-product">{r.productName}</td>
                    <td>
                      <StarRow rating={r.rating} />
                    </td>
                    <td className="reviews-body">{r.body}</td>
                    <td className="reviews-date">{fmtShort(r.createdAt)}</td>
                    <td>
                      <div className="reviews-actions">
                        {r.status === "pending" ? (
                          <button type="button" className="reviews-btn-approve" disabled={busy} onClick={() => onApprove(r.id)}>
                            {busy ? "…" : "Approve"}
                          </button>
                        ) : (
                          <span className="reviews-status-pill">{r.status}</span>
                        )}
                        <button type="button" className="reviews-link-remove" disabled={busy} onClick={() => onRemove(r.id)}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && reviews.length === 0 ? (
          <p className="reviews-empty"></p>
        ) : null}
      </div>
    </div>
  );
};

export default AdminReviewsPanel;
