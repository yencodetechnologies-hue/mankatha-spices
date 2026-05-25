import React, { useCallback, useEffect, useState } from "react";
import { Percent, CircleDollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { analyticsApi } from "../api/analyticsApi";
const RANGE_OPTIONS = [
  { value: 7, label: "Last 7 Days" },
  { value: 30, label: "Last 30 Days" },
  { value: 90, label: "Last 90 Days" },
];

const TRAFFIC_COLORS = {
  organic: "#ea580c",
  social: "#166534",
  direct: "#2563eb",
  email: "#a855f7",
  referral: "#dc2626",
};

function formatRelativeUpdated(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "Updated just now";
  if (m === 1) return "Updated 1 minute ago";
  if (m < 60) return `Updated ${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h === 1) return "Updated 1 hour ago";
  if (h < 24) return `Updated ${h} hours ago`;
  return `Updated ${Math.floor(h / 24)} day(s) ago`;
}

const TrendLine = ({ up }) => {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return <Icon size={14} className="analytics-trend-ico" aria-hidden />;
};

const AdminAnalyticsPanel = () => {
  const [rangeDays, setRangeDays] = useState(30);
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await analyticsApi.getAnalytics(rangeDays);
      setData(result);
      setErrorMessage("");
    } catch (error) {
      const detail = error.response?.data?.message;
      setErrorMessage(detail || error.message || "Failed to load analytics");
      setData(null);
    }
  }, [rangeDays]);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = data?.kpis;
  const topProducts = data?.topProducts || [];
  const trafficSources = data?.trafficSources || [];
  const topCities = data?.topCities || [];

  return (
    <div className="admin-analytics">
      <div className="analytics-head">
        <div>
          <h2 className="analytics-title">Analytics</h2>
          <p className="analytics-sub">
            {data?.periodLabel ? `${data.periodLabel} · ` : ""}
            {data?.updatedAt ? formatRelativeUpdated(data.updatedAt) : ""}
          </p>
        </div>
        <div className="analytics-head-actions">
          <label className="analytics-range-label" htmlFor="analytics-range">
            <span className="sr-only">Date range</span>
            <select
              id="analytics-range"
              className="analytics-range-select"
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {errorMessage ? (
        <div className="overview-fail-state" role="alert">
          <h3 className="overview-fail-title">Could not load analytics</h3>
          <p className="overview-fail-msg">{errorMessage}</p>
          <p className="overview-fail-hint">
            After starting MongoDB and the API, run{" "}
            <code>cd backend &amp;&amp; npm run seed:analytics</code> to create sample traffic data.
          </p>
          <button type="button" className="overview-btn-primary overview-retry" onClick={load}>
            Retry
          </button>
        </div>
      ) : null}



      {kpis ? (
        <div className="analytics-kpi-grid">
          <article className="analytics-kpi-card">
            <div className="analytics-kpi-icon" style={{ background: "#ecfdf5", color: "#15803d" }}>
              <Percent size={20} strokeWidth={2} />
            </div>
            <p className="analytics-kpi-label">Conversion rate</p>
            <p className="analytics-kpi-value">{kpis.conversionRate.display}</p>
            <p className={`analytics-kpi-trend${kpis.conversionRate.positive ? " good" : " bad"}`}>
              <TrendLine up={kpis.conversionRate.deltaPoints >= 0} />
              {kpis.conversionRate.deltaPoints >= 0 ? "+" : ""}
              {kpis.conversionRate.deltaPoints} pts vs prior period
            </p>
          </article>
          <article className="analytics-kpi-card">
            <div className="analytics-kpi-icon" style={{ background: "#fffbeb", color: "#b45309" }}>
              <CircleDollarSign size={20} strokeWidth={2} />
            </div>
            <p className="analytics-kpi-label">Avg. order value</p>
            <p className="analytics-kpi-value">{kpis.avgOrderValue.display}</p>
            <p className={`analytics-kpi-trend${kpis.avgOrderValue.positive ? " good" : " bad"}`}>
              <TrendLine up={kpis.avgOrderValue.deltaAmount >= 0} />
              {kpis.avgOrderValue.deltaAmount >= 0 ? "+" : "−"}
              ₹{Math.abs(kpis.avgOrderValue.deltaAmount).toLocaleString("en-IN")} vs prior period
            </p>
          </article>
          <article className="analytics-kpi-card">
            <div className="analytics-kpi-icon" style={{ background: "#fef2f2", color: "#b91c1c" }}>
              <ShoppingCart size={20} strokeWidth={2} />
            </div>
            <p className="analytics-kpi-label">Cart abandonment</p>
            <p className="analytics-kpi-value">{kpis.cartAbandonment.display}</p>
            <p className={`analytics-kpi-trend${kpis.cartAbandonment.positive ? " good" : " bad"}`}>
              <TrendLine up={kpis.cartAbandonment.deltaPoints >= 0} />
              {kpis.cartAbandonment.deltaPoints >= 0 ? "+" : ""}
              {kpis.cartAbandonment.deltaPoints} pts vs prior period
            </p>
          </article>
        </div>
      ) : null}

      {data && !errorMessage ? (
        <div className="analytics-charts-row">
          <section className="analytics-card">
            <h3 className="analytics-card-title">Top products by revenue</h3>
            {topProducts.length === 0 ? (
              <p className="analytics-empty"></p>
            ) : (
              <ul className="analytics-product-list">
                {topProducts.map((p) => (
                  <li key={p.name} className="analytics-product-row">
                    <div className="analytics-product-rank">{p.rank}</div>
                    <div className="analytics-product-body">
                      <div className="analytics-product-top">
                        <span className="analytics-product-name">{p.name}</span>
                        <span className="analytics-product-meta">
                          {p.revenueDisplay} · {p.unitSales} sales
                        </span>
                      </div>
                      <div className="analytics-product-bar-track">
                        <div className="analytics-product-bar-fill" style={{ width: `${p.barPct}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="analytics-card analytics-card-split">
            <div>
              <h3 className="analytics-card-title">Traffic sources</h3>
              {trafficSources.length === 0 ? (
                <p className="analytics-empty">No pageview data. Run backend seed:analytics.</p>
              ) : (
                <ul className="analytics-traffic-list">
                  {trafficSources.map((t) => (
                    <li key={t.key} className="analytics-traffic-row">
                      <span className="analytics-traffic-label">{t.label}</span>
                      <div className="analytics-traffic-bar-wrap">
                        <div
                          className="analytics-traffic-bar"
                          style={{
                            width: `${Math.min(100, t.percent)}%`,
                            background: TRAFFIC_COLORS[t.key] || "#78716c",
                          }}
                        />
                      </div>
                      <span className="analytics-traffic-pct">{t.percent}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="analytics-cities-block">
              <h3 className="analytics-card-title">Top cities</h3>
              {topCities.length === 0 ? (
                <p className="analytics-empty">No city data in pageviews.</p>
              ) : (
                <ul className="analytics-city-list">
                  {topCities.map((c) => (
                    <li key={c.city}>
                      <span>{c.city}</span>
                      <span className="analytics-city-pct">{c.percent}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default AdminAnalyticsPanel;
