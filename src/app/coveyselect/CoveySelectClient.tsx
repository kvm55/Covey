"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { FUND_LIST, getFundForStrategy } from "@/data/funds";
import type { FundStrategy, FundConfig } from "@/data/funds";
import { COVEY_DEBT_TERMS } from "@/data/covey-debt";
import type { InvestmentType } from "@/utils/underwriting";
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
  financing_source?: string;
};

type FundStats = {
  dealCount: number;
  totalValue: number;
  avgCapRate: number;
  avgIRR: number;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

const DEBT_TERM_ROWS: { type: InvestmentType; label: string }[] = [
  { type: "Long Term Rental", label: "Long Term Rental" },
  { type: "Fix and Flip", label: "Fix & Flip" },
  { type: "Short Term Rental", label: "Short Term Rental" },
];

export default function CoveySelectClient({ properties }: { properties: Property[] }) {
  const [activeCard, setActiveCard] = useState<FundStrategy | "debt" | null>(null);

  // Refs for smooth scrolling
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  function getPropertiesForFund(fundId: FundStrategy): Property[] {
    return properties.filter((p) => {
      const strategy = p.fund_strategy || getFundForStrategy(p.type);
      return strategy === fundId;
    });
  }

  // Compute per-fund stats
  const fundStats = useMemo(() => {
    const stats: Record<FundStrategy, FundStats> = {} as Record<FundStrategy, FundStats>;
    for (const fund of FUND_LIST) {
      const fundProps = properties.filter((p) => {
        const strategy = p.fund_strategy || getFundForStrategy(p.type);
        return strategy === fund.id;
      });
      const count = fundProps.length;
      const totalValue = fundProps.reduce((sum, p) => sum + p.price, 0);
      const avgCapRate =
        count > 0
          ? fundProps.reduce((sum, p) => sum + p.cap_rate * 100, 0) / count
          : 0;
      const avgIRR =
        count > 0
          ? fundProps.reduce((sum, p) => sum + p.irr * 100, 0) / count
          : 0;
      stats[fund.id] = { dealCount: count, totalValue, avgCapRate, avgIRR };
    }
    return stats;
  }, [properties]);

  // Debt pipeline stats
  const debtPipeline = useMemo(() => {
    const coveyFinanced = properties.filter(
      (p) => p.financing_source === "covey_debt"
    );
    const loanCount = coveyFinanced.length;
    const deployed = coveyFinanced.reduce(
      (sum, p) => sum + Math.round(p.price * 0.75),
      0
    );
    return { loanCount, deployed };
  }, [properties]);

  function scrollToSection(key: string) {
    const el = sectionRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>CoveySelect</h1>
        <p className={styles.heroTagline}>
          Five equity strategies. One captive lender. Your complete capital stack.
        </p>
      </div>

      {/* Capital Stack Grid */}
      <section className={styles.capitalGridSection}>
        <h2 className={styles.sectionHeading}>Capital Stack Overview</h2>
        <div className={styles.capitalGrid}>
          {FUND_LIST.map((fund) => {
            const stats = fundStats[fund.id];
            return (
              <button
                key={fund.id}
                className={`${styles.fundCard} ${activeCard === fund.id ? styles.fundCardActive : ""}`}
                onClick={() => {
                  setActiveCard(fund.id);
                  scrollToSection(fund.id);
                }}
              >
                <div
                  className={styles.fundCardBar}
                  style={{ backgroundColor: fund.color }}
                />
                <div className={styles.fundCardBody}>
                  <div className={styles.fundCardHeader}>
                    <span className={styles.fundCardName}>{fund.name}</span>
                    <span
                      className={styles.fundCardLabel}
                      style={{ backgroundColor: fund.color }}
                    >
                      {fund.label}
                    </span>
                  </div>
                  <div className={styles.fundCardMeta}>
                    <span>Risk: {fund.riskLevel}</span>
                    <span>Target: {fund.targetReturn}</span>
                  </div>
                  <div className={styles.fundCardDivider} />
                  <div className={styles.fundCardStats}>
                    <span>{stats.dealCount} {stats.dealCount === 1 ? "deal" : "deals"}</span>
                    <span className={styles.fundCardDot} />
                    <span>{formatCompact(stats.totalValue)} total</span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Debt Fund Card */}
          <button
            className={`${styles.fundCard} ${styles.debtCard} ${activeCard === "debt" ? styles.fundCardActive : ""}`}
            onClick={() => {
              setActiveCard("debt");
              scrollToSection("debt");
            }}
          >
            <div
              className={styles.fundCardBar}
              style={{ backgroundColor: "var(--color-pine)" }}
            />
            <div className={styles.fundCardBody}>
              <div className={styles.fundCardHeader}>
                <span className={styles.fundCardName}>Covey Debt Fund</span>
                <span
                  className={styles.fundCardLabel}
                  style={{ backgroundColor: "var(--color-pine)" }}
                >
                  Lending
                </span>
              </div>
              <div className={styles.fundCardMeta}>
                <span>Target: 8-12% yield</span>
              </div>
              <div className={styles.fundCardDivider} />
              <div className={styles.fundCardStats}>
                <span>
                  {debtPipeline.loanCount}{" "}
                  {debtPipeline.loanCount === 1 ? "loan" : "loans"}
                </span>
                <span className={styles.fundCardDot} />
                <span>{formatCompact(debtPipeline.deployed)} deployed</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Fund Detail Sections */}
      {FUND_LIST.map((fund) => {
        const fundProperties = getPropertiesForFund(fund.id);
        const stats = fundStats[fund.id];

        return (
          <section
            key={fund.id}
            ref={(el) => { sectionRefs.current[fund.id] = el; }}
            className={styles.fundSection}
          >
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

            {/* Stats Bar */}
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{stats.dealCount}</span>
                <span className={styles.statLabel}>Deals</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatCompact(stats.totalValue)}
                </span>
                <span className={styles.statLabel}>Total Value</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {stats.avgCapRate > 0 ? `${stats.avgCapRate.toFixed(1)}%` : "--"}
                </span>
                <span className={styles.statLabel}>Avg Cap Rate</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {stats.avgIRR > 0 ? `${stats.avgIRR.toFixed(1)}%` : "--"}
                </span>
                <span className={styles.statLabel}>Avg IRR</span>
              </div>
            </div>

            {/* Property Grid */}
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
                      imageUrl={
                        property.image_url ||
                        "/images/property-placeholder.jpg"
                      }
                      type={property.type}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      squareFeet={property.square_feet}
                      irr={`${(property.irr * 100).toFixed(1)}%`}
                      capRate={`${(property.cap_rate * 100).toFixed(1)}%`}
                      equityMultiple={`${property.equity_multiple.toFixed(1)}x`}
                      price={formatPrice(property.price)}
                      fundStrategy={
                        property.fund_strategy ||
                        getFundForStrategy(property.type)
                      }
                    />
                  </Link>
                ))
              ) : (
                <div className={styles.emptyState}>
                  No properties currently aligned to the {fund.name}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className={styles.fundActions}>
              <Link href="/compass" className={styles.investCta}>
                Invest via Compass
              </Link>
              <Link
                href={`/marketplace?fund=${fund.id}`}
                className={styles.exploreLink}
              >
                Explore in Marketplace →
              </Link>
            </div>
          </section>
        );
      })}

      {/* Debt Fund Detail Section */}
      <section
        ref={(el) => { sectionRefs.current["debt"] = el; }}
        className={`${styles.fundSection} ${styles.debtSection}`}
      >
        <div className={styles.fundHeader}>
          <div
            className={styles.fundColorBar}
            style={{ backgroundColor: "var(--color-pine)" }}
          />
          <h2 className={styles.fundTitle}>Covey Debt Fund</h2>
          <span
            className={styles.fundLabel}
            style={{ backgroundColor: "var(--color-pine)" }}
          >
            Lending
          </span>
        </div>
        <p className={styles.fundDescription}>
          Captive financing for Covey equity fund deals. Earn fixed-income
          returns by funding the acquisitions that power the flywheel.
        </p>

        {/* Pipeline Stats */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{debtPipeline.loanCount}</span>
            <span className={styles.statLabel}>Active Loans</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {formatCompact(debtPipeline.deployed)}
            </span>
            <span className={styles.statLabel}>Capital Deployed</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>8-12%</span>
            <span className={styles.statLabel}>Target Yield</span>
          </div>
        </div>

        {/* Lending Terms Table */}
        <div className={styles.termsTableWrap}>
          <h3 className={styles.termsHeading}>Lending Terms</h3>
          <table className={styles.termsTable}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Max LTV</th>
                <th>Base Rate</th>
                <th>Amort</th>
                <th>IO Period</th>
                <th>Term</th>
              </tr>
            </thead>
            <tbody>
              {DEBT_TERM_ROWS.map(({ type, label }) => {
                const terms = COVEY_DEBT_TERMS[type];
                return (
                  <tr key={type}>
                    <td>{label}</td>
                    <td>{terms.maxLTV}%</td>
                    <td>{terms.baseRate.toFixed(1)}%</td>
                    <td>
                      {terms.interestOnly
                        ? "IO Only"
                        : `${terms.amortYears} yr`}
                    </td>
                    <td>
                      {terms.termMonths
                        ? `${terms.ioYears} mo`
                        : `${terms.ioYears} yr`}
                    </td>
                    <td>
                      {terms.termMonths
                        ? `${terms.termMonths} mo`
                        : `${terms.termYears} yr`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Debt CTA */}
        <div className={styles.fundActions}>
          <Link href="/compass" className={styles.investCta}>
            Fund the Flywheel — Invest via Compass
          </Link>
        </div>
      </section>
    </div>
  );
}
