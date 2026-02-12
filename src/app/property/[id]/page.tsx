'use client';

import React from "react";
import { useParams } from "next/navigation";
import { properties } from "@/data/properties";
import styles from "./PropertyDetailPage.module.css";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className={styles.container}>
        <h1>Property Not Found</h1>
        <p>No property found with ID: <strong>{id}</strong></p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>{property.streetAddress}</h1>
      <img src={property.imageUrl} alt={property.streetAddress} />
      <p><strong>Address:</strong> {property.streetAddress}, {property.city}, {property.state} {property.zip}</p>
      <p><strong>Type:</strong> {property.type}</p>
      <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
      <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
      <p><strong>Square Feet:</strong> {property.squareFeet}</p>
      <p><strong>Cap Rate:</strong> {(property.capRate * 100).toFixed(1)}%</p>
      <p><strong>IRR:</strong> {(property.irr * 100).toFixed(1)}%</p>
      <p><strong>Equity Multiple:</strong> {property.equityMultiple.toFixed(1)}x</p>

      <div className={styles.underwritingSection}>
        <h2>Underwriting Details</h2>

        <h3>Sources & Uses</h3>
        <ul>
          <li><strong>Purchase Price:</strong> ${property.price.toLocaleString()}</li>
          <li><strong>Renovations:</strong> ${property.renovations.toLocaleString()}</li>
          <li><strong>Reserves:</strong> ${property.reserves.toLocaleString()}</li>
          <li><strong>Debt Costs:</strong> ${property.debtCosts.toLocaleString()}</li>
          <li><strong>Equity:</strong> ${property.equity.toLocaleString()}</li>
          <li><strong>Total:</strong> ${(property.price + property.renovations + property.reserves + property.debtCosts + property.equity).toLocaleString()}</li>
        </ul>

        <h3>Debt Terms</h3>
        <ul>
          <li><strong>Loan-to-Cost (LTC):</strong> {property.ltc.toFixed(1)}%</li>
          <li><strong>Interest Rate:</strong> {property.interestRate.toFixed(1)}%</li>
          <li><strong>Amortization:</strong> {property.amortization} years</li>
        </ul>

        <h3>Disposition</h3>
        <ul>
          <li><strong>Exit Cap Rate:</strong> {property.exitCapRate.toFixed(1)}%</li>
          <li><strong>Net Sale Proceeds:</strong> ${property.netSaleProceeds.toLocaleString()}</li>
          <li><strong>Net Sale / Unit:</strong> ${property.netSalePerUnit.toLocaleString()}</li>
          <li><strong>Profit Multiple:</strong> {property.profitMultiple.toFixed(2)}x</li>
        </ul>

        <h3>Financial Metrics</h3>
        <ul>
          <li><strong>In-Place Rent:</strong> ${property.inPlaceRent.toLocaleString()}/unit</li>
          <li><strong>Stabilized Rent:</strong> ${property.stabilizedRent.toLocaleString()}/unit</li>
          <li><strong>NOI Margin:</strong> {(property.noiMargin * 100).toFixed(1)}%</li>
          <li><strong>DSCR:</strong> {property.dscr.toFixed(1)}</li>
          <li><strong>Spread:</strong> {property.spread} bps</li>
        </ul>
      </div>
    </div>
  );
}