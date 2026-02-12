'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { properties } from "@/data/properties";
import { PropertyInputs, UnderwritingResults, runUnderwriting, formatCurrency, formatPercent, formatMultiple } from "@/utils/underwriting";
import styles from "./PropertyDetailPage.module.css";

interface DealData {
  id: string;
  inputs: PropertyInputs;
  results: UnderwritingResults;
  createdAt: string;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [deal, setDeal] = useState<DealData | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'projections'>('summary');

  // Check localStorage for underwritten deals
  useEffect(() => {
    const stored = localStorage.getItem(`covey-deal-${id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Re-run calculations to ensure freshness
      const results = runUnderwriting(parsed.inputs);
      setDeal({ ...parsed, results });
    }
  }, [id]);

  // Fallback: check mock data
  const mockProperty = properties.find((p) => p.id === id);

  if (!deal && !mockProperty) {
    return (
      <div className={styles.container}>
        <h1 className={styles.notFoundTitle}>Property Not Found</h1>
        <p className={styles.notFoundText}>No property found with ID: <strong>{id}</strong></p>
        <Link href="/marketplace" className={styles.backLink}>← Back to Marketplace</Link>
      </div>
    );
  }

  // If it's a legacy mock property, show simple view
  if (!deal && mockProperty) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/marketplace" className={styles.backLink}>← Back to Marketplace</Link>
          <h1 className={styles.title}>{mockProperty.streetAddress}</h1>
          <p className={styles.subtitle}>{mockProperty.city}, {mockProperty.state} {mockProperty.zip}</p>
        </div>
        <div className={styles.metricsBar}>
          <div className={styles.metricItem}><span className={styles.metricLabel}>Cap Rate</span><span className={styles.metricVal}>{(mockProperty.capRate * 100).toFixed(1)}%</span></div>
          <div className={styles.metricItem}><span className={styles.metricLabel}>IRR</span><span className={styles.metricVal}>{(mockProperty.irr * 100).toFixed(1)}%</span></div>
          <div className={styles.metricItem}><span className={styles.metricLabel}>Equity Multiple</span><span className={styles.metricVal}>{mockProperty.equityMultiple.toFixed(2)}x</span></div>
        </div>
        <div className={styles.detailGrid}>
          <div className={styles.detailCard}>
            <h3>Property Details</h3>
            <div className={styles.detailRow}><span>Type</span><strong>{mockProperty.type}</strong></div>
            <div className={styles.detailRow}><span>Bedrooms</span><strong>{mockProperty.bedrooms}</strong></div>
            <div className={styles.detailRow}><span>Bathrooms</span><strong>{mockProperty.bathrooms}</strong></div>
            <div className={styles.detailRow}><span>Square Feet</span><strong>{mockProperty.squareFeet.toLocaleString()}</strong></div>
            <div className={styles.detailRow}><span>Price</span><strong>${mockProperty.price.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>
    );
  }

  // Full underwritten deal view
  const { inputs: inp, results: res } = deal!;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/property/new" className={styles.backLink}>← Back to Underwriting</Link>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>{inp.streetAddress || 'Untitled Deal'}</h1>
            <p className={styles.subtitle}>
              {inp.city}{inp.city && inp.state ? ', ' : ''}{inp.state} {inp.zip}
              {inp.type && <span className={styles.typeBadge}>{inp.type}</span>}
            </p>
          </div>
          <div className={styles.dealId}>ID: {deal!.id}</div>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className={styles.metricsBar}>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>IRR</span>
          <span className={`${styles.metricVal} ${styles.metricPrimary}`}>{formatPercent(res.irr)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Cash-on-Cash</span>
          <span className={`${styles.metricVal} ${styles.metricPrimary}`}>{formatPercent(res.cashOnCash)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Cap Rate</span>
          <span className={styles.metricVal}>{formatPercent(res.capRate)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Equity Multiple</span>
          <span className={styles.metricVal}>{formatMultiple(res.equityMultiple)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>DSCR</span>
          <span className={`${styles.metricVal} ${res.dscr > 0 && res.dscr < 1.2 ? styles.metricWarn : ''}`}>{res.dscr.toFixed(2)}x</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Total Profit</span>
          <span className={`${styles.metricVal} ${res.totalProfit >= 0 ? styles.metricPositive : styles.metricNegative}`}>{formatCurrency(res.totalProfit)}</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div className={styles.tabNav}>
        <button className={`${styles.tab} ${activeTab === 'summary' ? styles.tabActive : ''}`} onClick={() => setActiveTab('summary')}>Deal Summary</button>
        <button className={`${styles.tab} ${activeTab === 'projections' ? styles.tabActive : ''}`} onClick={() => setActiveTab('projections')}>Year-by-Year</button>
      </div>

      {activeTab === 'summary' && (
        <div className={styles.detailGrid}>
          {/* Sources & Uses */}
          <div className={styles.detailCard}>
            <h3>Sources & Uses</h3>
            <div className={styles.detailRow}><span>Purchase Price</span><strong>{formatCurrency(inp.purchasePrice)}</strong></div>
            <div className={styles.detailRow}><span>Closing Costs</span><strong>{formatCurrency(inp.closingCosts)}</strong></div>
            <div className={styles.detailRow}><span>Renovations</span><strong>{formatCurrency(inp.renovations)}</strong></div>
            <div className={styles.detailRow}><span>Reserves</span><strong>{formatCurrency(inp.reserves)}</strong></div>
            <div className={`${styles.detailRow} ${styles.detailTotal}`}><span>Total Project Cost</span><strong>{formatCurrency(res.totalProjectCost)}</strong></div>
            <div className={styles.detailRow}><span>Loan Amount</span><strong>{formatCurrency(inp.loanAmount)}</strong></div>
            <div className={`${styles.detailRow} ${styles.detailTotal}`}><span>Equity Required</span><strong>{formatCurrency(res.totalEquityRequired)}</strong></div>
            <div className={styles.detailRow}><span>LTV</span><strong>{formatPercent(res.loanToValue)}</strong></div>
            <div className={styles.detailRow}><span>LTC</span><strong>{formatPercent(res.loanToCost)}</strong></div>
          </div>

          {/* Debt Terms */}
          <div className={styles.detailCard}>
            <h3>Debt Service</h3>
            <div className={styles.detailRow}><span>Interest Rate</span><strong>{formatPercent(inp.interestRate)}</strong></div>
            <div className={styles.detailRow}><span>Amortization</span><strong>{inp.amortizationYears} yrs</strong></div>
            <div className={styles.detailRow}><span>Interest Only</span><strong>{inp.interestOnly ? 'Yes' : 'No'}</strong></div>
            <div className={styles.detailRow}><span>Monthly Payment</span><strong>{formatCurrency(res.monthlyDebtService)}</strong></div>
            <div className={`${styles.detailRow} ${styles.detailTotal}`}><span>Annual Debt Service</span><strong>{formatCurrency(res.annualDebtService)}</strong></div>
          </div>

          {/* Income */}
          <div className={styles.detailCard}>
            <h3>{inp.type === 'Short Term Rental' ? 'STR Revenue' : 'Rental Income'}</h3>
            <div className={styles.detailRow}><span>Gross Scheduled Income</span><strong>{formatCurrency(res.grossScheduledIncome)}</strong></div>
            {res.vacancyLoss > 0 && <div className={styles.detailRow}><span>Less: Vacancy</span><strong className={styles.metricNegative}>({formatCurrency(res.vacancyLoss)})</strong></div>}
            <div className={`${styles.detailRow} ${styles.detailTotal}`}><span>Effective Gross Income</span><strong>{formatCurrency(res.effectiveGrossIncome)}</strong></div>
            <div className={styles.detailRow}><span>Operating Expenses</span><strong>({formatCurrency(res.totalOperatingExpenses)})</strong></div>
            <div className={styles.detailRow}><span>Expense Ratio</span><strong>{formatPercent(res.expenseRatio)}</strong></div>
            <div className={`${styles.detailRow} ${styles.detailTotal}`}><span>Net Operating Income</span><strong className={res.noi >= 0 ? styles.metricPositive : styles.metricNegative}>{formatCurrency(res.noi)}</strong></div>
            <div className={styles.detailRow}><span>NOI Margin</span><strong>{formatPercent(res.noiMargin)}</strong></div>
          </div>

          {/* Cash Flow */}
          <div className={styles.detailCard}>
            <h3>Cash Flow</h3>
            <div className={styles.detailRow}><span>NOI</span><strong>{formatCurrency(res.noi)}</strong></div>
            <div className={styles.detailRow}><span>Less: Debt Service</span><strong>({formatCurrency(res.annualDebtService)})</strong></div>
            <div className={`${styles.detailRow} ${styles.detailTotal}`}><span>Annual Cash Flow</span><strong className={res.cashFlowAfterDebt >= 0 ? styles.metricPositive : styles.metricNegative}>{formatCurrency(res.cashFlowAfterDebt)}</strong></div>
            <div className={styles.detailRow}><span>Monthly Cash Flow</span><strong className={res.monthlyCashFlow >= 0 ? styles.metricPositive : styles.metricNegative}>{formatCurrency(res.monthlyCashFlow)}</strong></div>
          </div>

          {/* Disposition */}
          <div className={styles.detailCard}>
            <h3>Exit / Disposition</h3>
            {inp.type !== 'Fix and Flip' && <>
              <div className={styles.detailRow}><span>Hold Period</span><strong>{inp.holdPeriodYears} yrs</strong></div>
              <div className={styles.detailRow}><span>Exit Cap Rate</span><strong>{formatPercent(inp.exitCapRate)}</strong></div>
            </>}
            <div className={styles.detailRow}><span>Projected Sale Price</span><strong>{formatCurrency(res.projectedSalePrice)}</strong></div>
            <div className={styles.detailRow}><span>Selling Costs ({formatPercent(inp.sellingCosts)})</span><strong>({formatCurrency(res.projectedSalePrice * inp.sellingCosts / 100)})</strong></div>
            <div className={styles.detailRow}><span>Remaining Loan Balance</span><strong>({formatCurrency(res.loanBalance)})</strong></div>
            <div className={`${styles.detailRow} ${styles.detailTotal}`}><span>Net Sale Proceeds</span><strong className={res.netSaleProceeds >= 0 ? styles.metricPositive : styles.metricNegative}>{formatCurrency(res.netSaleProceeds)}</strong></div>
          </div>

          {/* Per Unit */}
          {inp.units > 1 && (
            <div className={styles.detailCard}>
              <h3>Per Unit Metrics</h3>
              <div className={styles.detailRow}><span>Price / Unit</span><strong>{formatCurrency(res.pricePerUnit)}</strong></div>
              <div className={styles.detailRow}><span>Rent / Unit</span><strong>{formatCurrency(res.rentPerUnit)}/mo</strong></div>
              <div className={styles.detailRow}><span>NOI / Unit</span><strong>{formatCurrency(res.noiPerUnit)}</strong></div>
            </div>
          )}

          {/* Flip-specific */}
          {inp.type === 'Fix and Flip' && res.flipProfit !== undefined && (
            <div className={styles.detailCard}>
              <h3>Flip Analysis</h3>
              <div className={styles.detailRow}><span>After Repair Value</span><strong>{formatCurrency(inp.afterRepairValue)}</strong></div>
              <div className={styles.detailRow}><span>Timeline</span><strong>{inp.monthsToComplete} months</strong></div>
              <div className={`${styles.detailRow} ${styles.detailTotal}`}><span>Flip Profit</span><strong className={(res.flipProfit || 0) >= 0 ? styles.metricPositive : styles.metricNegative}>{formatCurrency(res.flipProfit || 0)}</strong></div>
              <div className={styles.detailRow}><span>Flip ROI</span><strong>{formatPercent(res.flipROI || 0)}</strong></div>
              <div className={styles.detailRow}><span>Annualized ROI</span><strong>{formatPercent(res.flipAnnualizedROI || 0)}</strong></div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projections' && (
        <div className={styles.tableWrapper}>
          <table className={styles.projectionTable}>
            <thead>
              <tr>
                <th>Year</th>
                <th>Gross Income</th>
                <th>Expenses</th>
                <th>NOI</th>
                <th>Debt Service</th>
                <th>Cash Flow</th>
                <th>Property Value</th>
                <th>Loan Balance</th>
                <th>Equity</th>
              </tr>
            </thead>
            <tbody>
              {res.yearlyProjections.map(yr => (
                <tr key={yr.year}>
                  <td>{yr.year}</td>
                  <td>{formatCurrency(yr.grossIncome)}</td>
                  <td>{formatCurrency(yr.operatingExpenses)}</td>
                  <td className={yr.noi >= 0 ? styles.metricPositive : styles.metricNegative}>{formatCurrency(yr.noi)}</td>
                  <td>{formatCurrency(yr.debtService)}</td>
                  <td className={yr.cashFlow >= 0 ? styles.metricPositive : styles.metricNegative}>{formatCurrency(yr.cashFlow)}</td>
                  <td>{formatCurrency(yr.propertyValue)}</td>
                  <td>{formatCurrency(yr.loanBalance)}</td>
                  <td>{formatCurrency(yr.equity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
