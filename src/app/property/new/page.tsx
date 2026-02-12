"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    id: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    price: "",
    units: "",
    type: "Long Term Hold",
    renovations: "",
    reserves: "",
    debtCosts: "",
    equity: "",
    ltc: "",
    interestRate: "",
    amortization: "",
    exitCapRate: "",
    inPlaceRent: "",
    stabilizedRent: "",
    vacancy: "",
    noiMargin: "",
    dscr: "",
    spread: "",
  });

  const generateId = () => {
    const stateCode = form.state.toUpperCase();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${stateCode}-${random}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = generateId();
    setForm((prev) => ({ ...prev, id: newId }));
    console.log("Created property:", { ...form, id: newId });
    alert(`New property created with ID: ${newId}`);
    router.push("/marketplace");
  };

  return (
    <div style={{ padding: "32px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Create New Property</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <input name="streetAddress" placeholder="Street Address" value={form.streetAddress} onChange={handleChange} required />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required />
        <input name="zip" placeholder="Zip" value={form.zip} onChange={handleChange} required />
        <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} required />
        <input name="units" placeholder="Units" type="number" value={form.units} onChange={handleChange} required />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="Long Term Hold">Long Term Hold</option>
          <option value="Fix and Flip">Fix and Flip</option>
          <option value="Short Term Rental">Short Term Rental</option>
        </select>
        <input name="renovations" placeholder="Renovations" type="number" value={form.renovations} onChange={handleChange} />
        <input name="reserves" placeholder="Reserves" type="number" value={form.reserves} onChange={handleChange} />
        <input name="debtCosts" placeholder="Debt Costs" type="number" value={form.debtCosts} onChange={handleChange} />
        <input name="equity" placeholder="Equity" type="number" value={form.equity} onChange={handleChange} />
        <input name="ltc" placeholder="LTC" type="number" value={form.ltc} onChange={handleChange} />
        <input name="interestRate" placeholder="Interest Rate" type="number" step="0.01" value={form.interestRate} onChange={handleChange} />
        <input name="amortization" placeholder="Amortization" type="number" value={form.amortization} onChange={handleChange} />
        <input name="exitCapRate" placeholder="Exit Cap Rate" type="number" step="0.01" value={form.exitCapRate} onChange={handleChange} />
        <input name="inPlaceRent" placeholder="In Place Rent" type="number" value={form.inPlaceRent} onChange={handleChange} />
        <input name="stabilizedRent" placeholder="Stabilized Rent" type="number" value={form.stabilizedRent} onChange={handleChange} />
        <input name="vacancy" placeholder="Vacancy" type="number" step="0.01" value={form.vacancy} onChange={handleChange} />
        <input name="noiMargin" placeholder="NOI Margin" type="number" step="0.01" value={form.noiMargin} onChange={handleChange} />
        <input name="dscr" placeholder="DSCR" type="number" step="0.01" value={form.dscr} onChange={handleChange} />
        <input name="spread" placeholder="Spread" type="number" step="0.01" value={form.spread} onChange={handleChange} />
        <button type="submit">Create Property</button>
      </form>
    </div>
  );
}