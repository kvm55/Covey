'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase";
import { PropertyInputs, UnderwritingResults, runUnderwriting, formatCurrency, formatPercent, formatMultiple } from "@/utils/underwriting";
import { FUNDS, getFundForStrategy } from "@/data/funds";
import type { FundStrategy } from "@/data/funds";
import type { UnderwritingScenarioRow } from "@/types/underwriting";
import { fetchScenarios, createScenario, promoteScenario, deleteScenario, toStrategyType } from "@/utils/scenarios";
import { createCoveyDebtScenario } from "@/utils/covey-debt-scenarios";
import ScenarioList from "@/components/ScenarioList/ScenarioList";
import styles from "./PropertyDetailPage.module.css";

interface SupabaseProperty {
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
}

type TabKey = 'summary' | 'projections' | 'scenarios';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [scenarios, setScenarios] = useState<UnderwritingScenarioRow[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [supabaseProperty, setSupabaseProperty] = useState<SupabaseProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [coveyCompareError, setCoveyCompareError] = useState<string | null>(null);

  // ── Load data ────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      const propertyId = id as string;

      // 1. Try scenarios table
      const scenarioRows = await fetchScenarios(propertyId);

      if (scenarioRows.length > 0) {
        setScenarios(scenarioRows);
        const primary = scenarioRows.find(s => s.is_primary) || scenarioRows[0];
        setActiveScenarioId(primary.id);
        setLoading(false);
        return;
      }

      // 2. Check localStorage for backward compat migration
      const stored = localStorage.getItem(`covey-deal-${propertyId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const inputs = parsed.inputs as PropertyInputs;
          const results = runUnderwriting(inputs);

          const newScenario = await createScenario({
            propertyId,
            strategyType: toStrategyType(inputs.type),
            inputs,
            results,
            isPrimary: true,
          });

          if (newScenario) {
            setScenarios([newScenario]);
            setActiveScenarioId(newScenario.id);
            localStorage.removeItem(`covey-deal-${propertyId}`);
          }
          setLoading(false);
          return;
        } catch {
          // Fall through to supabase property
        }
      }

      // 3. Fall back to bare properties row (seed data)
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      if (!error && data) {
        setSupabaseProperty(data);
      }
      setLoading(false);
    }

    loadData();
  }, [id]);

  // ── Scenario actions ────────────────────────────────────────
  const reloadScenarios = useCallback(async () => {
    const rows = await fetchScenarios(id as string);
    setScenarios(rows);
    // Keep active selection if still valid, else pick primary
    if (!rows.find(s => s.id === activeScenarioId)) {
      const primary = rows.find(s => s.is_primary) || rows[0];
      setActiveScenarioId(primary?.id ?? null);
    }
  }, [id, activeScenarioId]);

  const handlePromote = useCallback(async (scenarioId: string) => {
    await promoteScenario(scenarioId);
    await reloadScenarios();
  }, [reloadScenarios]);

  const handleDelete = useCallback(async (scenarioId: string) => {
    await deleteScenario(scenarioId);
    await reloadScenarios();
  }, [reloadScenarios]);

  const handleNewScenario = useCallback(async () => {
    const active = scenarios.find(s => s.id === activeScenarioId);
    if (!active) return;

    const count = scenarios.length + 1;
    const newScenario = await createScenario({
      propertyId: id as string,
      name: `Scenario ${count}`,
      strategyType: active.strategy_type,
      inputs: active.inputs,
      results: active.results,
      isPrimary: false,
    });

    if (newScenario) {
      await reloadScenarios();
      setActiveScenarioId(newScenario.id);
      setActiveTab('scenarios');
    }
  }, [id, scenarios, activeScenarioId, reloadScenarios]);

  const toggleCompare = useCallback((scenarioId: string) => {
    setCompareIds(prev => {
      if (prev.includes(scenarioId)) return prev.filter(id => id !== scenarioId);
      if (prev.length >= 3) return prev;
      return [...prev, scenarioId];
    });
  }, []);

  const handleCoveyCompare = useCallback(async () => {
    const active = scenarios.find(s => s.id === activeScenarioId);
    if (!active) return;

    setCoveyCompareError(null);
    const result = await createCoveyDebtScenario(
      id as string,
      active.inputs as PropertyInputs,
      active.results as UnderwritingResults,
      scenarios.length,
    );

    if (result.success && result.scenarioId) {
      await reloadScenarios();
      setActiveScenarioId(result.scenarioId);
      setActiveTab('scenarios');
    } else {
      setCoveyCompareError(result.reason || 'Could not create Covey financing scenario');
    }
  }, [id, scenarios, activeScenarioId, reloadScenarios]);

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return <div className={styles.container}><p>Loading property...</p></div>;
  }

  // ── Not found ────────────────────────────────────────────────
  if (scenarios.length === 0 && !supabaseProperty) {
    return (
      <div className={styles.container}>
        <h1 className={styles.notFoundTitle}>Property Not Found</h1>
        <p className={styles.notFoundText}>No property found with ID: <strong>{id}</strong></p>
        <Link href="/marketplace" className={styles.backLink}>← Back to Marketplace</Link>
      </div>
    );
  }

  // ── Supabase-only property view (seed data, no scenarios) ───
  if (scenarios.length === 0 && supabaseProperty) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/marketplace" className={styles.backLink}>← Back to Marketplace</Link>
          <h1 className={styles.title}>{supabaseProperty.street_address}</h1>
          <p className={styles.subtitle}>
            {supabaseProperty.city}, {supabaseProperty.state} {supabaseProperty.zip}
            {(() => {
              const fundId = supabaseProperty.fund_strategy || getFundForStrategy(supabaseProperty.type);
              const fund = FUNDS[fundId];
              return (
                <span className={styles.fundBadge} style={{ backgroundColor: fund.color }}>
                  {fund.name.replace(' Fund', '')} ({fund.label})
                </span>
              );
            })()}
          </p>
        </div>
        <div className={styles.metricsBar}>
          <div className={styles.metricItem}><span className={styles.metricLabel}>Cap Rate</span><span className={styles.metricVal}>{(supabaseProperty.cap_rate * 100).toFixed(1)}%</span></div>
          <div className={styles.metricItem}><span className={styles.metricLabel}>IRR</span><span className={styles.metricVal}>{(supabaseProperty.irr * 100).toFixed(1)}%</span></div>
          <div className={styles.metricItem}><span className={styles.metricLabel}>Equity Multiple</span><span className={styles.metricVal}>{supabaseProperty.equity_multiple.toFixed(2)}x</span></div>
        </div>
        <div className={styles.detailGrid}>
          <div className={styles.detailCard}>
            <h3>Property Details</h3>
            <div className={styles.detailRow}><span>Type</span><strong>{supabaseProperty.type}</strong></div>
            <div className={styles.detailRow}><span>Bedrooms</span><strong>{supabaseProperty.bedrooms}</strong></div>
            <div className={styles.detailRow}><span>Bathrooms</span><strong>{supabaseProperty.bathrooms}</strong></div>
            <div className={styles.detailRow}><span>Square Feet</span><strong>{supabaseProperty.square_feet.toLocaleString()}</strong></div>
            <div className={styles.detailRow}><span>Price</span><strong>${supabaseProperty.price.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>
    );
  }

  // ── Full scenario-backed view ───────────────────────────────
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const inp = activeScenario.inputs as PropertyInputs;
  const res = activeScenario.results as UnderwritingResults;

  const compareScenarios = scenarios.filter(s => compareIds.includes(s.id));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/marketplace" className={styles.backLink}>← Back to Marketplace</Link>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>{inp.streetAddress || 'Untitled Deal'}</h1>
            <p className={styles.subtitle}>
              {inp.city}{inp.city && inp.state ? ', ' : ''}{inp.state} {inp.zip}
              {inp.type && (
                <>
                  {(() => {
                    const fund = FUNDS[getFundForStrategy(inp.type)];
                    return (
                      <span className={styles.fundBadge} style={{ backgroundColor: fund.color }}>
                        {fund.name.replace(' Fund', '')} ({fund.label})
                      </span>
                    );
                  })()}
                  <span className={styles.typeBadge}>{inp.type}</span>
                </>
              )}
            </p>
          </div>
          <div className={styles.headerRight}>
            {scenarios.length > 1 && (
              <div className={styles.scenarioSelector}>
                <label className={styles.scenarioSelectorLabel}>Scenario:</label>
                <select
                  className={styles.scenarioSelect}
                  value={activeScenarioId || ''}
                  onChange={(e) => setActiveScenarioId(e.target.value)}
                >
                  {scenarios.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.is_primary ? '★ ' : ''}{s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
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
        <button className={`${styles.tab} ${activeTab === 'scenarios' ? styles.tabActive : ''}`} onClick={() => setActiveTab('scenarios')}>
          Scenarios{scenarios.length > 1 ? ` (${scenarios.length})` : ''}
        </button>
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
            <div className={styles.detailRow}>
              <span>Financing</span>
              <strong>
                {inp.financingSource === 'covey_debt' ? (
                  <span className={styles.coveyDebtBadge}>Covey Debt Fund</span>
                ) : (
                  <span>External Lender</span>
                )}
              </strong>
            </div>
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

      {activeTab === 'scenarios' && (
        <div>
          <ScenarioList
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelect={(scenarioId) => {
              setActiveScenarioId(scenarioId);
              setActiveTab('summary');
            }}
            onPromote={handlePromote}
            onDelete={handleDelete}
            onNew={handleNewScenario}
          />

          {/* Covey Debt Comparison */}
          {inp.financingSource !== 'covey_debt' && (
            <div className={styles.coveyCompareSection}>
              <button className={styles.coveyCompareButton} onClick={handleCoveyCompare}>
                Compare with Covey Financing
              </button>
              {coveyCompareError && (
                <div className={styles.coveyCompareAlert}>{coveyCompareError}</div>
              )}
            </div>
          )}

          {/* Compare mode */}
          {scenarios.length >= 2 && (
            <div className={styles.compareSection}>
              <div className={styles.compareHeader}>
                <button
                  className={`${styles.compareToggle} ${compareMode ? styles.compareToggleActive : ''}`}
                  onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}
                >
                  {compareMode ? 'Exit Compare' : 'Compare Scenarios'}
                </button>
              </div>

              {compareMode && (
                <div>
                  <div className={styles.compareCheckboxes}>
                    {scenarios.map(s => (
                      <label key={s.id} className={styles.compareCheckbox}>
                        <input
                          type="checkbox"
                          checked={compareIds.includes(s.id)}
                          onChange={() => toggleCompare(s.id)}
                          disabled={!compareIds.includes(s.id) && compareIds.length >= 3}
                        />
                        {s.is_primary && '★ '}{s.name}
                      </label>
                    ))}
                  </div>

                  {compareScenarios.length >= 2 && (
                    <div className={styles.tableWrapper}>
                      <table className={styles.compareTable}>
                        <thead>
                          <tr>
                            <th>Metric</th>
                            {compareScenarios.map(s => (
                              <th key={s.id}>{s.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: 'Financing', fn: (_r: UnderwritingResults, i: PropertyInputs) => i.financingSource === 'covey_debt' ? 'Covey Debt Fund' : 'External' },
                            { label: 'IRR', fn: (r: UnderwritingResults) => formatPercent(r.irr) },
                            { label: 'Cap Rate', fn: (r: UnderwritingResults) => formatPercent(r.capRate) },
                            { label: 'Equity Multiple', fn: (r: UnderwritingResults) => formatMultiple(r.equityMultiple) },
                            { label: 'DSCR', fn: (r: UnderwritingResults) => `${r.dscr.toFixed(2)}x` },
                            { label: 'Interest Rate', fn: (_r: UnderwritingResults, i: PropertyInputs) => formatPercent(i.interestRate) },
                            { label: 'NOI', fn: (r: UnderwritingResults) => formatCurrency(r.noi) },
                            { label: 'Cash Flow/mo', fn: (r: UnderwritingResults) => formatCurrency(r.monthlyCashFlow) },
                            { label: 'Total Profit', fn: (r: UnderwritingResults) => formatCurrency(r.totalProfit) },
                            { label: 'Cash-on-Cash', fn: (r: UnderwritingResults) => formatPercent(r.cashOnCash) },
                            { label: 'Equity Required', fn: (r: UnderwritingResults) => formatCurrency(r.totalEquityRequired) },
                          ].map(row => (
                            <tr key={row.label}>
                              <td className={styles.compareMetricLabel}>{row.label}</td>
                              {compareScenarios.map(s => (
                                <td key={s.id}>{row.fn(s.results as UnderwritingResults, s.inputs as PropertyInputs)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
