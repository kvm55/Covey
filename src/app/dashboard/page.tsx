"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase";

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

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [buyBox, setBuyBox] = useState({
    minPrice: 0,
    maxPrice: 10000000,
    minCapRate: 0,
    maxCapRate: 20,
  });

  useEffect(() => {
    async function fetchProperties() {
      const supabase = createClient();
      const { data, error } = await supabase.from("properties").select("*");
      if (error) {
        console.error("Error fetching properties:", error.message);
      } else {
        setProperties(data || []);
      }
      setLoading(false);
    }
    fetchProperties();
  }, []);

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

  if (loading) return <main className="container"><p>Loading dashboard...</p></main>;

  return (
    <main className="container">
      <h1>Dashboard</h1>

      <section>
        <h2>Portfolio Overview</h2>
        <ul>
          <li>Total Value: ${totalValue.toLocaleString()}</li>
          <li>Average Cap Rate: {avgCapRate.toFixed(2)}%</li>
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
          Min Cap Rate (%):
          <input
            type="number"
            value={buyBox.minCapRate}
            onChange={(e) => setBuyBox({ ...buyBox, minCapRate: parseFloat(e.target.value) })}
          />
        </label>
        <label>
          Max Cap Rate (%):
          <input
            type="number"
            value={buyBox.maxCapRate}
            onChange={(e) => setBuyBox({ ...buyBox, maxCapRate: parseFloat(e.target.value) })}
          />
        </label>
      </section>

      <section>
        <h2>Matching Properties</h2>
        <ul>
          {filteredProperties.map((p) => (
            <li key={p.id}>
              {p.street_address}, {p.city} – ${p.price.toLocaleString()} – Cap Rate: {(p.cap_rate * 100).toFixed(2)}%
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