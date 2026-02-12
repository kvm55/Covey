"use client";
import { useState } from "react";
import { properties } from "@/data/properties";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [buyBox, setBuyBox] = useState({
    minPrice: 0,
    maxPrice: 10000000,
    minYield: 0,
    maxYield: 20,
    markets: [] as string[],
  });

  const portfolioProperties = properties.filter((p) => portfolio.includes(p.id));
  const totalValue = portfolioProperties.reduce((sum, p) => sum + p.price, 0);
  const avgYield = portfolioProperties.length
    ? portfolioProperties.reduce((sum, p) => sum + (p.projectedStabilizedYield * 100), 0) / portfolioProperties.length
    : 0;
  const avgIrr = portfolioProperties.length
    ? portfolioProperties.reduce((sum, p) => sum + (p.irr * 100), 0) / portfolioProperties.length
    : 0;
  const avgEquityMultiple = portfolioProperties.length
    ? portfolioProperties.reduce((sum, p) => sum + p.equityMultiple, 0) / portfolioProperties.length
    : 0;

  const handleAddToPortfolio = (id: string) => {
    if (!portfolio.includes(id)) setPortfolio([...portfolio, id]);
  };

  const handleRemoveFromPortfolio = (id: string) => {
    setPortfolio(portfolio.filter((p) => p !== id));
  };

  const filteredProperties = properties.filter((p) => {
    const yieldPercent = p.projectedStabilizedYield * 100;
    return (
      p.price >= buyBox.minPrice &&
      p.price <= buyBox.maxPrice &&
      yieldPercent >= buyBox.minYield &&
      yieldPercent <= buyBox.maxYield &&
      (buyBox.markets.length === 0 || buyBox.markets.includes(p.market))
    );
  });

  return (
    <main className="container">
      <h1>Dashboard</h1>

      <section>
        <h2>Portfolio Overview</h2>
        <ul>
          <li>Total Value: ${totalValue.toLocaleString()}</li>
          <li>Average Yield: {avgYield.toFixed(2)}%</li>
          <li>Average IRR: {avgIrr.toFixed(2)}%</li>
          <li>Average Equity Multiple: {avgEquityMultiple.toFixed(2)}x</li>
        </ul>
      </section>

      <section>
        <h2>Map</h2>
        <div style={{ width: "100%", height: "300px", backgroundColor: "#eee", textAlign: "center", lineHeight: "300px" }}>
          Map Placeholder
        </div>
      </section>

      <section>
        <h2>Buy Box</h2>
        <label>
          Min Price: $
          <input
            type="number"
            value={buyBox.minPrice}
            onChange={(e) => setBuyBox({ ...buyBox, minPrice: parseInt(e.target.value) })}
          />
        </label>
        <label>
          Max Price: $
          <input
            type="number"
            value={buyBox.maxPrice}
            onChange={(e) => setBuyBox({ ...buyBox, maxPrice: parseInt(e.target.value) })}
          />
        </label>
        <label>
          Min Yield: 
          <input
            type="number"
            value={buyBox.minYield}
            onChange={(e) => setBuyBox({ ...buyBox, minYield: parseFloat(e.target.value) })}
          />
        </label>
        <label>
          Max Yield: 
          <input
            type="number"
            value={buyBox.maxYield}
            onChange={(e) => setBuyBox({ ...buyBox, maxYield: parseFloat(e.target.value) })}
          />
        </label>
      </section>

      <section>
        <h2>Matching Properties</h2>
        <ul>
          {filteredProperties.map((p) => (
            <li key={p.id}>
              {p.title} – ${p.price.toLocaleString()} – Yield: {(p.projectedStabilizedYield * 100).toFixed(2)}%
              <button onClick={() => handleAddToPortfolio(p.id)}>Add</button>
              <button onClick={() => handleRemoveFromPortfolio(p.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Property Breakdown</h2>
        <p>Details and charts about property types and locations.</p>
      </section>

      <section>
        <h2>Sensitivity Analysis</h2>
        <p>Interactive sensitivity analysis tools.</p>
      </section>

      <section>
        <h2>Demographics</h2>
        <p>Demographic data visualization.</p>
      </section>
    </main>
  );
}