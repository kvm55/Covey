"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PropertyFilter from "@/components/PropertyFilter";
import PropertyCard from "@/components/PropertyCard";
import styles from "./Marketplace.module.css";
import { createClient } from "@/utils/supabase";
import { getFundForStrategy, FUNDS } from "@/data/funds";
import type { FundStrategy } from "@/data/funds";

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

const ITEMS_PER_PAGE = 12;

type SortOption = "price_asc" | "price_desc" | "cap_rate" | "irr" | "equity_multiple";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <p>Loading properties...</p>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const fundParam = searchParams.get("fund");
  const initialFund = fundParam && fundParam in FUNDS ? fundParam : "All";

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(initialFund);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("price_asc");
  const [currentPage, setCurrentPage] = useState(1);
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
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
    setCurrentPage(1);
  };

  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const filtered = properties.filter((property) => {
      const matchesSearch =
        !query ||
        property.street_address.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query);

      const propertyFund = property.fund_strategy || getFundForStrategy(property.type);
      const matchesFund = selectedType === "All" || propertyFund === selectedType;

      return (
        matchesSearch &&
        matchesFund &&
        property.bedrooms <= filters.bedrooms.max &&
        property.bathrooms <= filters.bathrooms.max &&
        property.square_feet <= filters.squareFeet.max &&
        property.cap_rate * 100 <= filters.capRate.max &&
        property.irr * 100 <= filters.irr.max &&
        property.equity_multiple <= filters.equityMultiple.max
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "cap_rate":
          return b.cap_rate - a.cap_rate;
        case "irr":
          return b.irr - a.irr;
        case "equity_multiple":
          return b.equity_multiple - a.equity_multiple;
        default:
          return 0;
      }
    });

    return sorted;
  }, [properties, searchQuery, selectedType, filters, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedProperties = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (loading)
    return (
      <div className={styles.container}>
        <p>Loading properties...</p>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Marketplace</h1>
        <p className={styles.subtitle}>Explore investment opportunities</p>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by address or city..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <select
          className={styles.sortSelect}
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="price_asc">Price (Low → High)</option>
          <option value="price_desc">Price (High → Low)</option>
          <option value="cap_rate">Cap Rate</option>
          <option value="irr">IRR</option>
          <option value="equity_multiple">Equity Multiple</option>
        </select>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <PropertyFilter
            selectedType={selectedType}
            onChange={handleTypeChange}
            onRangeChange={handleRangeChange}
          />
        </div>
        <div className={styles.cardGrid}>
          {paginatedProperties.length > 0 ? (
            paginatedProperties.map((property) => {
              const formattedCapRate = `${(property.cap_rate * 100).toFixed(1)}%`;
              const formattedIrr = `${(property.irr * 100).toFixed(1)}%`;
              const formattedEquityMultiple = `${property.equity_multiple.toFixed(1)}x`;
              const formattedPrice = formatPrice(property.price);
              const fundStrategy = property.fund_strategy || getFundForStrategy(property.type);

              return (
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
                    irr={formattedIrr}
                    capRate={formattedCapRate}
                    equityMultiple={formattedEquityMultiple}
                    price={formattedPrice}
                    fundStrategy={fundStrategy}
                  />
                </Link>
              );
            })
          ) : (
            <p className={styles.noResults}>No properties match your filters.</p>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {pageNumbers.map((num) => (
            <button
              key={num}
              className={`${styles.pageNumber} ${
                currentPage === num ? styles.pageNumberActive : ""
              }`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
