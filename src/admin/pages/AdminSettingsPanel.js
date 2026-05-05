import React, { useCallback, useEffect, useState } from "react";
import { settingsApi } from "../api/settingsApi";

const TABS = [
  { id: "general", label: "General" },
  { id: "payments", label: "Payments" },
  { id: "shipping", label: "Shipping" },
  { id: "notifications", label: "Notifications" },
  { id: "seo", label: "SEO" },
  { id: "security", label: "Security" },
];

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
  { value: "AED", label: "AED" },
  { value: "LKR", label: "LKR (Rs.)" },
  { value: "EUR", label: "EUR (€)" },
];

const DEFAULT_FORM = {
  storeName: "SpiceEmpire",
  contactEmail: "admin@spiceempire.in",
  phone: "+91 44 2345 6789",
  currency: "INR",
  storeAddress: "23, Spice Market Road, Chennai 600001, Tamil Nadu",
  newOrderAlerts: true,
  lowStockWarnings: true,
  customerReviewNotifications: false,
  dailyRevenueReport: true,
  showProductReviews: true,
  enableWishlists: true,
  whatsappChatButton: false,
};

const NOTIFICATION_ROWS = [
  {
    key: "newOrderAlerts",
    title: "New Order Alerts",
    description: "Receive email when new orders placed",
  },
  {
    key: "lowStockWarnings",
    title: "Low Stock Warnings",
    description: "Alert when stock drops below minimum",
  },
  {
    key: "customerReviewNotifications",
    title: "Customer Reviews",
    description: "Notify when new reviews submitted",
  },
  {
    key: "dailyRevenueReport",
    title: "Daily Revenue Report",
    description: "Receive daily sales summary at 9 AM",
  },
];

const DISPLAY_ROWS = [
  {
    key: "showProductReviews",
    title: "Show Product Reviews",
    description: "Display customer reviews on product pages",
  },
  {
    key: "enableWishlists",
    title: "Enable Wishlists",
    description: "Allow customers to save products",
  },
  {
    key: "whatsappChatButton",
    title: "WhatsApp Chat Button",
    description: "Show WhatsApp support button on site",
  },
];

function ToggleSwitch({ checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      className={`admin-switch${checked ? " admin-switch--on" : ""}`}
      onClick={() => onChange(!checked)}
    />
  );
}

function mergeServerIntoForm(data) {
  if (!data) return { ...DEFAULT_FORM };
  const b = (v, d) => (typeof v === "boolean" ? v : d);
  return {
    storeName: data.storeName ?? DEFAULT_FORM.storeName,
    contactEmail: data.contactEmail ?? DEFAULT_FORM.contactEmail,
    phone: data.phone ?? DEFAULT_FORM.phone,
    currency: data.currency ?? DEFAULT_FORM.currency,
    storeAddress: data.storeAddress ?? DEFAULT_FORM.storeAddress,
    newOrderAlerts: b(data.newOrderAlerts, DEFAULT_FORM.newOrderAlerts),
    lowStockWarnings: b(data.lowStockWarnings, DEFAULT_FORM.lowStockWarnings),
    customerReviewNotifications: b(data.customerReviewNotifications, DEFAULT_FORM.customerReviewNotifications),
    dailyRevenueReport: b(data.dailyRevenueReport, DEFAULT_FORM.dailyRevenueReport),
    showProductReviews: b(data.showProductReviews, DEFAULT_FORM.showProductReviews),
    enableWishlists: b(data.enableWishlists, DEFAULT_FORM.enableWishlists),
    whatsappChatButton: b(data.whatsappChatButton, DEFAULT_FORM.whatsappChatButton),
  };
}

const AdminSettingsPanel = () => {
  const [tab, setTab] = useState("general");
  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await settingsApi.getSettings();
      setForm(mergeServerIntoForm(data));
      setDirty(false);
    } catch (err) {
      const detail = err.response?.data?.message;
      let msg = detail || err.message || "Could not load settings.";
      if (err.response?.status === 404) {
        const port = process.env.REACT_APP_BACKEND_PORT || "5000";
        const proxiedHealth =
          typeof window !== "undefined" ? `${window.location.origin}/api/health` : "/api/health";
        const directHealth = `http://127.0.0.1:${port}/api/health`;
        msg = `Settings API returned 404. 1) Restart the React dev server (npm start) after any setupProxy change. 2) With dev server running, open ${proxiedHealth} — JSON must list routes.settings. 3) If that fails, open ${directHealth} (Express must run on port ${port}; set REACT_APP_BACKEND_PORT in .env to match backend PORT). Start API: npm run api from repo root or cd backend && npm start.`;
      }
      setErrorMessage(msg);
      setForm({ ...DEFAULT_FORM });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaveOk(false);
  };

  const save = async () => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSaveOk(false);
      const data = await settingsApi.saveSettings(form);
      setForm(mergeServerIntoForm(data));
      setDirty(false);
      setSaveOk(true);
    } catch (err) {
      const detail = err.response?.data?.message;
      let msg = detail || err.message || "Save failed.";
      if (err.response?.status === 404) {
        msg = `Save failed (404). See the load error above: backend must expose PUT /api/settings (via proxy: ${typeof window !== "undefined" ? window.location.origin : ""}/api/settings).`;
      }
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings-page">
      <div className="settings-page-header">
        <div>
          <h2 className="settings-page-title">Settings</h2>
          <p className="settings-page-sub">Manage your store configuration.</p>
        </div>
        <button type="button" className="settings-save-btn primary-btn" onClick={save} disabled={saving || !dirty}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {errorMessage ? <div className="status-error settings-banner">{errorMessage}</div> : null}
      {saveOk ? <div className="settings-save-ok">Settings saved.</div> : null}

      <div className="settings-layout">
        <nav className="settings-tab-nav" aria-label="Settings sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`settings-tab-btn${tab === t.id ? " settings-tab-btn--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="settings-main">
          {loading ? (
            <div className="settings-card settings-loading">Loading settings…</div>
          ) : tab === "general" ? (
            <>
              <section className="settings-card">
                <h3 className="settings-card-title">Store details</h3>
                <div className="settings-form-grid">
                  <div className="form-group">
                    <label htmlFor="settings-store-name">Store name</label>
                    <input
                      id="settings-store-name"
                      value={form.storeName}
                      onChange={(e) => setField("storeName", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="settings-email">Contact email</label>
                    <input
                      id="settings-email"
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setField("contactEmail", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="settings-phone">Phone</label>
                    <input id="settings-phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="settings-currency">Currency</label>
                    <select id="settings-currency" value={form.currency} onChange={(e) => setField("currency", e.target.value)}>
                      {CURRENCY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group settings-span-2">
                    <label htmlFor="settings-address">Store address</label>
                    <input id="settings-address" value={form.storeAddress} onChange={(e) => setField("storeAddress", e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="settings-card">
                <h3 className="settings-card-title">Notifications</h3>
                <ul className="settings-toggle-list">
                  {NOTIFICATION_ROWS.map((row) => (
                    <li key={row.key} className="settings-toggle-row">
                      <div className="settings-toggle-copy">
                        <span className="settings-toggle-title">{row.title}</span>
                        <p className="settings-toggle-desc">{row.description}</p>
                      </div>
                      <ToggleSwitch checked={form[row.key]} onChange={(v) => setField(row.key, v)} id={`toggle-${row.key}`} />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="settings-card">
                <h3 className="settings-card-title">Display settings</h3>
                <ul className="settings-toggle-list">
                  {DISPLAY_ROWS.map((row) => (
                    <li key={row.key} className="settings-toggle-row">
                      <div className="settings-toggle-copy">
                        <span className="settings-toggle-title">{row.title}</span>
                        <p className="settings-toggle-desc">{row.description}</p>
                      </div>
                      <ToggleSwitch checked={form[row.key]} onChange={(v) => setField(row.key, v)} id={`toggle-${row.key}`} />
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <section className="settings-card settings-placeholder-card">
              <h3 className="settings-card-title">{TABS.find((x) => x.id === tab)?.label}</h3>
              <p className="settings-placeholder-text">This section is coming soon. Use <strong>General</strong> for store details and notification toggles.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPanel;
