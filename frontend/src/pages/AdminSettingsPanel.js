import React, { useCallback, useEffect, useState } from "react";
import { settingsApi } from "../api/settingsApi";



const DEFAULT_FORM = {
  storeName: "SpiceEmpire",
  contactEmail: "admin@spiceempire.in",
  phone: "+91 44 2345 6789",
  currency: "INR",
  storeAddress: "23, Spice Market Road, Chennai 600001, Tamil Nadu",
};



function mergeServerIntoForm(data) {
  if (!data) return { ...DEFAULT_FORM };
  return {
    storeName: data.storeName ?? DEFAULT_FORM.storeName,
    contactEmail: data.contactEmail ?? DEFAULT_FORM.contactEmail,
    phone: data.phone ?? DEFAULT_FORM.phone,
    currency: data.currency ?? DEFAULT_FORM.currency,
    storeAddress: data.storeAddress ?? DEFAULT_FORM.storeAddress,
  };
}

const AdminSettingsPanel = () => {
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


        <div className="settings-main">
          {loading ? (
            <div className="settings-card settings-loading">Loading settings…</div>
          ) : (
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
                
                  <div className="form-group settings-span-2">
                    <label htmlFor="settings-address">Store address</label>
                    <input id="settings-address" value={form.storeAddress} onChange={(e) => setField("storeAddress", e.target.value)} />
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPanel;
