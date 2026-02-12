"use client";

import { useState } from "react";
import Link from "next/link";
import PropertyFilter from "@/components/PropertyFilter";
import PropertyCard from "@/components/PropertyCard";
import styles from "./Marketplace.module.css";
import { properties } from "@/data/properties";

export default function MarketplacePage() {
  const [selectedType, setSelectedType] = useState("All");
  const [filters, setFilters] = useState({
    bedrooms: { min: 0, max: 6 },
    bathrooms: { min: 0, max: 4 },
    squareFeet: { min: 0, max: 3000 },
    capRate: { min: 0, max: 15 },
    irr: { min: 0, max: 20 },
    equityMultiple: { min: 1, max: 3 },
  });

  const handleRangeChange = (filter: string, min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      [filter]: { min, max },
    }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Explore Investment Opportunities</h1>
      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <PropertyFilter
            selectedType={selectedType}
            onChange={setSelectedType}
            onRangeChange={handleRangeChange}
          />
        </div>
        <div className={styles.cardGrid}>
          {properties.length > 0 ? (
            properties
              .filter((property) => {
                const normalizedFilter = selectedType.toLowerCase().replace(/-/g, " ");
                const normalizedType = property.type.toLowerCase();
                return (
                  (selectedType === "All" || normalizedType === normalizedFilter) &&
                  property.bedrooms <= filters.bedrooms.max &&
                  property.bathrooms <= filters.bathrooms.max &&
                  property.squareFeet <= filters.squareFeet.max &&
                  (property.capRate * 100) <= filters.capRate.max &&
                  (property.irr * 100) <= filters.irr.max &&
                  property.equityMultiple <= filters.equityMultiple.max
                );
              })
              .map((property) => {
                const formattedCapRate = `${(property.capRate * 100).toFixed(1)}%`;
                const formattedIrr = `${(property.irr * 100).toFixed(1)}%`;
                const formattedEquityMultiple = `${property.equityMultiple.toFixed(1)}x`;

                return (
                  <Link key={property.id} href={`/property/${property.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <PropertyCard
                      streetAddress={property.streetAddress}
                      city={property.city}
                      state={property.state}
                      zip={property.zip}
                      imageUrl={property.imageUrl || "https://via.placeholder.com/300x180"}
                      type={property.type}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      squareFeet={property.squareFeet}
                      irr={formattedIrr}
                      capRate={formattedCapRate}
                      equityMultiple={formattedEquityMultiple}
                    />
                  </Link>
                );
              })
          ) : (
            <p>No properties available.</p>
          )}
        </div>
      </div>
    </div>
  );
}