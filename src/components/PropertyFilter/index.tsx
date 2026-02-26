"use client";
import { useState } from "react";
import { FUND_LIST } from "@/data/funds";
import styles from "./PropertyFilter.module.css";

type FilterProps = {
  selectedType: string;
  onChange: (type: string) => void;
  onRangeChange: (filter: string, min: number, max: number) => void;
};

const fundFilters = [
  { key: "All", label: "All", color: undefined },
  ...FUND_LIST.map((f) => ({
    key: f.id,
    label: `${f.bird.split(' ')[0]} (${f.label})`,
    color: f.color,
  })),
];

export default function PropertyFilter({ selectedType, onChange, onRangeChange }: FilterProps) {
  const [bedroomsRange, setBedroomsRange] = useState({ min: 0, max: 6 });
  const [bathroomsRange, setBathroomsRange] = useState({ min: 0, max: 4 });
  const [squareFeetRange, setSquareFeetRange] = useState({ min: 0, max: 3000 });
  const [capRateRange, setCapRateRange] = useState({ min: 0, max: 15 });
  const [irrRange, setIrrRange] = useState({ min: 0, max: 20 });
  const [equityMultipleRange, setEquityMultipleRange] = useState({ min: 1, max: 3 });

  return (
    <div className={styles.filterBar}>
      <p className={styles.filterTitle}>Fund Strategy</p>
      <div className={styles.typeSection}>
        {fundFilters.map((filter) => (
          <button
            key={filter.key}
            className={`${styles.button} ${selectedType === filter.key ? styles.active : ""}`}
            onClick={() => onChange(filter.key)}
          >
            {filter.color && (
              <span
                className={styles.colorDot}
                style={{ backgroundColor: filter.color }}
              />
            )}
            {filter.label}
          </button>
        ))}
      </div>
      <div className={styles.rangeSection}>
        <div className={styles.rangeFilter}>
          <label className={styles.label}>Bedrooms: {bedroomsRange.min} - {bedroomsRange.max}</label>
          <input
            type="range"
            className={styles.rangeInput}
            min="0"
            max="6"
            value={bedroomsRange.max}
            onChange={(e) => {
              const max = parseInt(e.target.value);
              setBedroomsRange({ min: 0, max });
              onRangeChange("bedrooms", 0, max);
            }}
          />
        </div>
        <div className={styles.rangeFilter}>
          <label className={styles.label}>Bathrooms: {bathroomsRange.min} - {bathroomsRange.max}</label>
          <input
            type="range"
            className={styles.rangeInput}
            min="0"
            max="4"
            value={bathroomsRange.max}
            onChange={(e) => {
              const max = parseInt(e.target.value);
              setBathroomsRange({ min: 0, max });
              onRangeChange("bathrooms", 0, max);
            }}
          />
        </div>
        <div className={styles.rangeFilter}>
          <label className={styles.label}>Sq Ft: {squareFeetRange.min} - {squareFeetRange.max}</label>
          <input
            type="range"
            className={styles.rangeInput}
            min="0"
            max="3000"
            value={squareFeetRange.max}
            onChange={(e) => {
              const max = parseInt(e.target.value);
              setSquareFeetRange({ min: 0, max });
              onRangeChange("squareFeet", 0, max);
            }}
          />
        </div>
        <div className={styles.rangeFilter}>
          <label className={styles.label}>Cap Rate (%): {capRateRange.min} - {capRateRange.max}</label>
          <input
            type="range"
            className={styles.rangeInput}
            min="0"
            max="15"
            value={capRateRange.max}
            onChange={(e) => {
              const max = parseInt(e.target.value);
              setCapRateRange({ min: 0, max });
              onRangeChange("capRate", 0, max);
            }}
          />
        </div>
        <div className={styles.rangeFilter}>
          <label className={styles.label}>IRR (%): {irrRange.min} - {irrRange.max}</label>
          <input
            type="range"
            className={styles.rangeInput}
            min="0"
            max="20"
            value={irrRange.max}
            onChange={(e) => {
              const max = parseInt(e.target.value);
              setIrrRange({ min: 0, max });
              onRangeChange("irr", 0, max);
            }}
          />
        </div>
        <div className={styles.rangeFilter}>
          <label className={styles.label}>Equity Multiple (x): {equityMultipleRange.min} - {equityMultipleRange.max}</label>
          <input
            type="range"
            className={styles.rangeInput}
            min="1"
            max="3"
            step="0.1"
            value={equityMultipleRange.max}
            onChange={(e) => {
              const max = parseFloat(e.target.value);
              setEquityMultipleRange({ min: 1, max });
              onRangeChange("equityMultiple", 1, max);
            }}
          />
        </div>
      </div>
    </div>
  );
}
