"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { FUND_LIST, getFundForStrategy } from "@/data/funds";
import type { FundStrategy } from "@/data/funds";
import { createClient } from "@/utils/supabase";
import styles from "./CoveySelect.module.css";

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
  fund_strategy: FundStrategy | null;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CoveySelectPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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

  function getPropertiesForFund(fundId: FundStrategy): Property[] {
    return properties.filter((p) => {
      const strategy = p.fund_strategy || getFundForStrategy(p.type);
      return strategy === fundId;
    });
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>CoveySelect</h1>
        <p className={styles.heroTagline}>
          Curated by Strategy — Pre-vetted bundles aligned to your investment thesis
        </p>
      </div>

      {FUND_LIST.map((fund) => {
        const fundProperties = getPropertiesForFund(fund.id);

        return (
          <section key={fund.id} className={styles.fundSection}>
            <div className={styles.fundHeader}>
              <div
                className={styles.fundColorBar}
                style={{ backgroundColor: fund.color }}
              />
              <h2 className={styles.fundTitle}>{fund.name}</h2>
              <span
                className={styles.fundLabel}
                style={{ backgroundColor: fund.color }}
              >
                {fund.label}
              </span>
            </div>
            <p className={styles.fundDescription}>{fund.strategySummary}</p>

            <div className={styles.fundGrid}>
              {fundProperties.length > 0 ? (
                fundProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/property/${property.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
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
                      irr={`${(property.irr * 100).toFixed(1)}%`}
                      capRate={`${(property.cap_rate * 100).toFixed(1)}%`}
                      equityMultiple={`${property.equity_multiple.toFixed(1)}x`}
                      price={formatPrice(property.price)}
                      fundStrategy={property.fund_strategy || getFundForStrategy(property.type)}
                    />
                  </Link>
                ))
              ) : (
                <div className={styles.emptyState}>
                  No properties currently aligned to the {fund.name}
                </div>
              )}
            </div>

            <Link
              href={`/marketplace?fund=${fund.id}`}
              className={styles.exploreLink}
            >
              Explore {fund.name} →
            </Link>
          </section>
        );
      })}
    </div>
  );
}
