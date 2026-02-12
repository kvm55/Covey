"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PropertyFilter from "@/components/PropertyFilter";
import PropertyCard from "@/components/PropertyCard";
import styles from "./Marketplace.module.css";
import { createClient } from "@/utils/supabase";

type Property = {
  id: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  image_url: string;
  cap_rate: number;
  irr: number;
  equity_multiple: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
};

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [filters, setFilters] = useState({
    bedrooms: { min: 0, max: 6 },
    bathrooms: { min: 0, max: 4 },
    squareFeet: { min: 0, max: 3000 },
    capRate: { min: 0, max: 15 },
    irr: { min: 0, max: 20 },
    equityMultiple: { min: 1, max: 3 },
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

  const handleRangeChange = (filter: string, min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      [filter]: { min, max },
    }));
  };

  if (loading) return <div className={styles.container}><p>Loading properties...</p></div>;

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
                  property.square_feet <= filters.squareFeet.max &&
                  (property.cap_rate * 100) <= filters.capRate.max &&
                  (property.irr * 100) <= filters.irr.max &&
                  property.equity_multiple <= filters.equityMultiple.max
                );
              })
              .map((property) => {
                const formattedCapRate = `${(property.cap_rate * 100).toFixed(1)}%`;
                const formattedIrr = `${(property.irr * 100).toFixed(1)}%`;
                const formattedEquityMultiple = `${property.equity_multiple.toFixed(1)}x`;

                return (
                  <Link key={property.id} href={`/property/${property.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <PropertyCard
                      streetAddress={property.street_address}
                      city={property.city}
                      state={property.state}
                      zip={property.zip}
                      imageUrl={property.image_url || "https://via.placeholder.com/300x180"}
                      type={property.type}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      squareFeet={property.square_feet}
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