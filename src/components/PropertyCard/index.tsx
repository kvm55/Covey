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
}: PropertyCardProps) {
  return (
    <div className={styles.card}>
      <img
        src={imageUrl || "https://via.placeholder.com/300x180"}
        alt="Property"
        className={styles.image}
      />
      <div className={styles.content}>
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
          <span className={styles.type}>{type}</span>
        </div>
      </div>
    </div>
  );
}