import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { couponsApi } from "../api/couponsApi";

const fmtExpires = (iso) =>
  new Intl.DateTimeFormat("en-IN", { month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));

const toDateInput = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const emptyForm = () => ({
  id: null,
  code: "",
  type: "percentage",
  value: 10,
  unlimited: false,
  usageLimit: "",
  expiresAt: toDateInput(new Date(Date.now() + 30 * 86400000)),
  isVipOnly: false,
  status: "active",
  usedCount: 0,
});

const AdminCouponsPanel = () => {
  const [stats, setStats] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await couponsApi.getCoupons();
      setCoupons(data.coupons || []);
      if (data.stats) {
        setStats(data.stats);
      } else {
        try {
          const s = await couponsApi.getStats();
          setStats(s);
        } catch {
          setStats(null);
        }
      }
    } catch (error) {
      const detail = error.response?.data?.message;
      let msg = detail || error.message || "Failed to load coupons.";
      if (error.response?.status === 404) {
        msg =
          "Coupons API endpoint was not found (404). Please verify that the backend server is running and configured correctly.";
      }
      setErrorMessage(msg);
      setCoupons([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const refresh = () => {
    loadCoupons();
  };

  const openCreate = () => {
    setErrorMessage("");
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setErrorMessage("");
    setForm({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value ?? (c.type === "percentage" ? 10 : 0),
      unlimited: c.usageLimit == null && !c.isVipOnly,
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      expiresAt: toDateInput(c.expiresAt),
      isVipOnly: !!c.isVipOnly,
      status: c.status === "inactive" ? "inactive" : "active",
      usedCount: c.usedCount ?? 0,
    });
    setModalOpen(true);
  };

  const openRenew = (c) => {
    setErrorMessage("");
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    setForm({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value ?? 0,
      unlimited: c.usageLimit == null && !c.isVipOnly,
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      expiresAt: toDateInput(d),
      isVipOnly: !!c.isVipOnly,
      status: "active",
      usedCount: c.usedCount ?? 0,
    });
    setModalOpen(true);
  };

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage("");
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        unlimited: form.unlimited,
        usageLimit: form.unlimited ? "" : form.usageLimit,
        expiresAt: form.expiresAt,
        isVipOnly: form.isVipOnly,
        status: form.status,
        usedCount: form.id ? form.usedCount : 0,
      };
      if (form.id) {
        await couponsApi.updateCoupon(form.id, payload);
      } else {
        await couponsApi.createCoupon(payload);
      }
      setModalOpen(false);
      setForm(emptyForm());
      refresh();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const activeLabel = stats != null ? `${stats.activeCount} active coupon codes` : "Loading…";

  return (
    <div className="admin-coupons">
      <div className="products-head coupons-head">
        <div>
          <h2>Coupons</h2>
          <p>{activeLabel}</p>
        </div>
        <button type="button" className="top-add-btn" onClick={openCreate}>
          + Create Coupon
        </button>
      </div>

      {errorMessage && !modalOpen ? (
        <div className="status-error" role="alert">
          {errorMessage}
          <button type="button" className="overview-btn-primary overview-retry inv-retry" onClick={() => refresh()}>
            Retry
          </button>
        </div>
      ) : null}

      {loading && !coupons.length ? <p className="analytics-loading">Loading coupons…</p> : null}

      <div className="coupons-table-card">
        <div className="coupons-table-wrap">
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Used</th>
                <th>Limit</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = c.status === "expired";
                return (
                  <tr key={c.id}>
                    <td>
                      <span className="coupons-code">{c.code}</span>
                    </td>
                    <td>{c.typeLabel}</td>
                    <td>{c.valueDisplay}</td>
                    <td>{c.usedCount}</td>
                    <td>{c.limitDisplay}</td>
                    <td className={expired ? "coupons-expires expired" : "coupons-expires"}>{fmtExpires(c.expiresAt)}</td>
                    <td>
                      <span
                        className={
                          c.status === "active" ? "coupons-pill active" : c.status === "expired" ? "coupons-pill danger" : "coupons-pill muted"
                        }
                      >
                        {c.status === "active" ? "Active" : c.status === "expired" ? "Expired" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {expired ? (
                        <button type="button" className="coupons-btn-renew" onClick={() => openRenew(c)}>
                          Renew
                        </button>
                      ) : (
                        <button type="button" className="coupons-btn-edit" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && coupons.length === 0 ? (
          <p className="coupons-empty">
            No coupons yet. Run <code>npm run seed:coupons</code> from the backend folder.
          </p>
        ) : null}
      </div>

      {modalOpen ? (
        <div className="modal-overlay">
          <div className="modal-card coupons-modal">
            <div className="modal-header">
              <h3>{form.id ? "Edit coupon" : "Create coupon"}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={22} />
              </button>
            </div>
            {errorMessage && modalOpen ? <div className="status-error">{errorMessage}</div> : null}
            <form onSubmit={submit} className="modal-form">
              <div className="grid-2">
                <div className="form-group">
                  <label>Code</label>
                  <input value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())} required placeholder="SPICE20" />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setField("type", e.target.value)}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed amount</option>
                    <option value="free_shipping">Free shipping</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value {form.type === "percentage" ? "(%)" : form.type === "fixed_amount" ? "(₹)" : ""}</label>
                  <input
                    type="number"
                    min={0}
                    step={form.type === "percentage" ? 1 : 1}
                    value={form.value}
                    onChange={(e) => setField("value", Number(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expires</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setField("expiresAt", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={form.unlimited} onChange={(e) => setField("unlimited", e.target.checked)} />{" "}
                    Unlimited redemptions
                  </label>
                </div>
                <div className="form-group">
                  <label>Usage limit (leave blank if unlimited checked)</label>
                  <input
                    type="number"
                    min={1}
                    disabled={form.unlimited}
                    value={form.usageLimit}
                    onChange={(e) => setField("usageLimit", e.target.value)}
                    placeholder="500"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={form.isVipOnly} onChange={(e) => setField("isVipOnly", e.target.checked)} /> VIP only
                  </label>
                </div>
                {form.id ? (
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                ) : null}
                {form.id ? (
                  <div className="form-group">
                    <label>Times used</label>
                    <input type="number" min={0} value={form.usedCount} onChange={(e) => setField("usedCount", Number(e.target.value))} />
                  </div>
                ) : null}
              </div>
              <div className="actions-row modal-actions">
                <button type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? "Saving…" : form.id ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminCouponsPanel;
