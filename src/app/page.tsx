import Link from "next/link";
import styles from "./home.module.css";
import PropertyCard from "@/components/PropertyCard";
import { properties } from "@/data/properties";

export default function HomePage() {
  const featured = properties.slice(0, 3);

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Smarter Real Estate Investing, Built for You
          </h1>
          <p className={styles.heroSubtitle}>
            Covey brings institutional-grade analytics to everyday investors so
            you can find, evaluate, and track deals with confidence.
          </p>
          <div className={styles.heroActions}>
            <Link href="/signup" className={styles.btnPrimary}>
              Get Started
            </Link>
            <Link href="/marketplace" className={styles.btnSecondary}>
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Covey?</h2>
        <div className={styles.grid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>Smart Analytics</h3>
            <p className={styles.featureDesc}>
              Instantly evaluate deals with IRR, cap rate, and equity multiple
              calculations — no spreadsheet required.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏘️</div>
            <h3 className={styles.featureTitle}>Curated Deals</h3>
            <p className={styles.featureDesc}>
              Browse a marketplace of vetted properties with transparent
              financials and investment-ready data.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3 className={styles.featureTitle}>Portfolio Tracking</h3>
            <p className={styles.featureDesc}>
              Monitor your holdings in one dashboard — track performance, manage
              documents, and plan your next move.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.grid}>
          <div>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Create Account</h3>
            <p className={styles.stepDesc}>
              Sign up in seconds and set your investment preferences to get
              personalized recommendations.
            </p>
          </div>
          <div>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Browse Opportunities</h3>
            <p className={styles.stepDesc}>
              Explore curated properties with detailed analytics so you can
              compare deals side by side.
            </p>
          </div>
          <div>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Build Portfolio</h3>
            <p className={styles.stepDesc}>
              Invest with confidence and track every property from acquisition
              through exit on your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className={styles.featuredProps}>
        <h2 className={styles.sectionTitle}>Featured Properties</h2>
        <div className={styles.propsGrid}>
          {featured.map((p) => (
            <Link
              key={p.id}
              href="/marketplace"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <PropertyCard
                streetAddress={p.streetAddress}
                city={p.city}
                state={p.state}
                zip={p.zip}
                imageUrl={p.imageUrl}
                type={p.type}
                bedrooms={p.bedrooms}
                bathrooms={p.bathrooms}
                squareFeet={p.squareFeet}
                irr={`${(p.irr * 100).toFixed(1)}%`}
                capRate={`${(p.capRate * 100).toFixed(1)}%`}
                equityMultiple={`${p.equityMultiple.toFixed(2)}x`}
                price={`$${p.price.toLocaleString()}`}
              />
            </Link>
          ))}
        </div>
        <Link href="/marketplace" className={styles.viewAll}>
          View All Properties
        </Link>
      </section>

      {/* ── Final CTA ── */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to Invest Smarter?</h2>
        <p className={styles.ctaSubtitle}>
          Join Covey today and get access to institutional-grade tools — for
          free.
        </p>
        <Link href="/signup" className={styles.btnPrimary}>
          Get Started Free
        </Link>
      </section>
    </>
  );
}
