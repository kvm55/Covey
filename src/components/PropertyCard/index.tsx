import Image from "next/image";
import { FUNDS } from "@/data/funds";
import type { FundStrategy } from "@/data/funds";
import styles from "./PropertyCard.module.css";

type PropertyCardProps = {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  imageUrl: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  irr: string;
  capRate: string;
  equityMultiple: string;
  price?: string;
  fundStrategy?: FundStrategy;
};

export default function PropertyCard({
  streetAddress,
  city,
  state,
  zip,
  imageUrl,
  type,
  bedrooms,
  bathrooms,
  squareFeet,
  irr,
  capRate,
  equityMultiple,
  price,
  fundStrategy,
}: PropertyCardProps) {
  const fund = fundStrategy ? FUNDS[fundStrategy] : null;

  return (
    <div className={styles.card}>
      <Image
        src={imageUrl || "/images/property-placeholder.jpg"}
        alt="Property"
        width={300}
        height={180}
        className={styles.image}
      />
      <div className={styles.content}>
        {price && <p className={styles.price}>{price}</p>}
        <div className={styles.metrics}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>IRR</span>
            <span className={styles.metricValue}>{irr}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Cap Rate</span>
            <span className={styles.metricValue}>{capRate}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Equity Mult</span>
            <span className={styles.metricValue}>{equityMultiple}</span>
          </div>
        </div>
        <div className={styles.propertyInfo}>
          <p className={styles.address}>{streetAddress}</p>
          <p className={styles.subaddress}>{`${city}, ${state} ${zip}`}</p>
          <div className={styles.details}>
            <span>🛏 {bedrooms}</span>
            <span>🛁 {bathrooms}</span>
            <span>📐 {squareFeet} SF</span>
          </div>
          <div className={styles.badgeRow}>
            {fund && (
              <span
                className={styles.strategyBadge}
                style={{ backgroundColor: fund.color }}
              >
                {fund.name.replace(' Fund', '')} ({fund.label})
              </span>
            )}
            <span className={styles.type}>{type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
