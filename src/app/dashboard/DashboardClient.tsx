"use client";

import { useState } from "react";
import styles from "./Dashboard.module.css";

type Property = {
  id: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  cap_rate: number;
  irr: number;
  equity_multiple: number;
  type: string;
  noi_margin: number | null;
};

export default function DashboardClient({ properties }: { properties: Property[] }) {
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [buyBox, setBuyBox] = useState({
    minPrice: 0,
    maxPrice: 10000000,
    minCapRate: 0,
    maxCapRate: 20,
  });

  const portfolioProperties = properties.filter((p) => portfolio.includes(p.id));
  const totalValue = portfolioProperties.reduce((sum, p) => sum + p.price, 0);
  const avgCapRate = portfolioProperties.length
    ? portfolioProperties.reduce((sum, p) => sum + (p.cap_rate * 100), 0) / portfolioProperties.length
    : 0;
  const avgIrr = portfolioProperties.length
    ? portfolioProperties.reduce((sum, p) => sum + (p.irr * 100), 0) / portfolioProperties.length
    : 0;
  const avgEquityMultiple = portfolioProperties.length
    ? portfolioProperties.reduce((sum, p) => sum + p.equity_multiple, 0) / portfolioProperties.length
    : 0;

  const handleAddToPortfolio = (id: string) => {
    if (!portfolio.includes(id)) setPortfolio([...portfolio, id]);
  };

  const handleRemoveFromPortfolio = (id: string) => {
    setPortfolio(portfolio.filter((p) => p !== id));
  };

  const filteredProperties = properties.filter((p) => {
    const capRatePercent = p.cap_rate * 100;
    return (
      p.price >= buyBox.minPrice &&
      p.price <= buyBox.maxPrice &&
      capRatePercent >= buyBox.minCapRate &&
      capRatePercent <= buyBox.maxCapRate
    );
  });

  return (
    <main className={styles.page}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Investment Dashboard</h1>
        <p className={styles.pageSubtitle}>Track your portfolio, set buy criteria, and discover matching properties.</p>
      </header>

      {/* Metrics Bar */}
      <div className={styles.metricsBar}>
        <div className={styles.metric}>
          <span className={styles.metricValue}>${totalValue.toLocaleString()}</span>
          <span className={styles.metricLabel}>Total Value</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>{avgCapRate.toFixed(2)}%</span>
          <span className={styles.metricLabel}>Avg Cap Rate</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>{avgIrr.toFixed(2)}%</span>
          <span className={styles.metricLabel}>Avg IRR</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>{avgEquityMultiple.toFixed(2)}x</span>
          <span className={styles.metricLabel}>Avg Equity Multiple</span>
        </div>
      </div>

      {/* Two-Column Grid: Map + Buy Box | Matching Properties */}
      <div className={styles.twoCol}>
        {/* Left Column */}
        <div>
          {/* Map Card */}
          <div className={styles.card} style={{ marginBottom: 24 }}>
            <h2 className={styles.cardTitle}>Map</h2>
            <div className={styles.mapPlaceholder}>Map Placeholder</div>
          </div>

          {/* Buy Box Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Buy Box</h2>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Min Price</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputPrefix}>$</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={buyBox.minPrice}
                    onChange={(e) => setBuyBox({ ...buyBox, minPrice: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Max Price</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputPrefix}>$</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={buyBox.maxPrice}
                    onChange={(e) => setBuyBox({ ...buyBox, maxPrice: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Min Cap Rate</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputPrefix}>%</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={buyBox.minCapRate}
                    onChange={(e) => setBuyBox({ ...buyBox, minCapRate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Max Cap Rate</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputPrefix}>%</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={buyBox.maxCapRate}
                    onChange={(e) => setBuyBox({ ...buyBox, maxCapRate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Matching Properties */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Matching Properties</h2>
          {filteredProperties.length === 0 ? (
            <div className={styles.emptyState}>No properties match your current filters.</div>
          ) : (
            <ul className={styles.propertyList}>
              {filteredProperties.map((p) => (
                <li key={p.id} className={styles.propertyItem}>
                  <div className={styles.propertyInfo}>
                    <span className={styles.propertyName}>{p.street_address}</span>
                    <span className={styles.propertyMeta}>
                      {p.city}, {p.state} &middot; ${p.price.toLocaleString()} &middot; Cap Rate: {(p.cap_rate * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className={styles.propertyActions}>
                    <button className={styles.btnAdd} onClick={() => handleAddToPortfolio(p.id)}>Add</button>
                    <button className={styles.btnRemove} onClick={() => handleRemoveFromPortfolio(p.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Three-Column Grid: Placeholder Cards */}
      <div className={styles.threeCol}>
        <div className={styles.card}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <h2 className={styles.cardTitle}>Property Breakdown</h2>
          <p className={styles.placeholderText}>Details and charts about property types and locations.</p>
        </div>
        <div className={styles.card}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <h2 className={styles.cardTitle}>Sensitivity Analysis</h2>
          <p className={styles.placeholderText}>Interactive sensitivity analysis tools.</p>
        </div>
        <div className={styles.card}>
          <span className={styles.comingSoonBadge}>Coming Soon</span>
          <h2 className={styles.cardTitle}>Demographics</h2>
          <p className={styles.placeholderText}>Demographic data visualization.</p>
        </div>
      </div>
    </main>
  );
}
