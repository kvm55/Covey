import React from 'react';
import styles from './hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Welcome to Covey</h1>
        <p className={styles.heroSubtitle}>
          Discover Smarter Real Estate Investing
        </p>
        <div className={styles.heroActions}>
          <a href="/opportunities" className={styles.heroButton}>
            Explore Opportunities
          </a>
          <a href="/learn-more" className={styles.heroButton}>
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}