"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./new.module.css";
import { createClient } from "@/utils/supabase";
import {
  PropertyInputs,
  InvestmentType,
  UnderwritingResults,
  runUnderwriting,
  getDefaultInputs,
  formatCurrency,
  formatPercent,
  formatMultiple,
} from "@/utils/underwriting";
import { FUNDS, getFundForStrategy } from "@/data/funds";
import { createScenario, toStrategyType } from "@/utils/scenarios";
import { qualifyForCoveyDebt, applyCoveyDebtTerms } from "@/data/covey-debt";

type FormSection = 'property' | 'acquisition' | 'debt' | 'income' | 'expenses' | 'disposition';

const SECTIONS: { key: FormSection; label: string }[] = [
  { key: 'property', label: 'Property Info' },
  { key: 'acquisition', label: 'Acquisition' },
  { key: 'debt', label: 'Debt Terms' },
  { key: 'income', label: 'Income' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'disposition', label: 'Exit Strategy' },
];

const INVESTMENT_TYPES: { value: InvestmentType; label: string; desc: string }[] = [
  { value: 'Long Term Rental', label: 'Long Term Rental', desc: 'Buy & hold for rental income and appreciation' },
  { value: 'Fix and Flip', label: 'Fix & Flip', desc: 'Renovate and sell for profit' },
  { value: 'Short Term Rental', label: 'Short Term Rental', desc: 'Airbnb / VRBO vacation rental' },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<FormSection>('property');
  const [inputs, setInputs] = useState<PropertyInputs>(getDefaultInputs('Long Term Rental'));

  const results: UnderwritingResults = useMemo(() => runUnderwriting(inputs), [inputs]);

  const isCovey = inputs.financingSource === 'covey_debt';

  const coveyQualification = useMemo(
    () => qualifyForCoveyDebt(inputs, results.noi),
    [inputs, results.noi],
  );

  const DEBT_FIELDS: Set<keyof PropertyInputs> = new Set([
    'loanAmount', 'interestRate', 'loanTermYears', 'amortizationYears', 'interestOnly',
  ]);

  const updateField = useCallback(<K extends keyof PropertyInputs>(field: K, value: PropertyInputs[K]) => {
    setInputs(prev => {
      // If user manually edits a Covey-locked debt field, switch back to External
      if (prev.financingSource === 'covey_debt' && DEBT_FIELDS.has(field)) {
        return { ...prev, [field]: value, financingSource: 'external' as const };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleTypeChange = useCallback((type: InvestmentType) => {
    setInputs(prev => ({
      ...getDefaultInputs(type),
      streetAddress: prev.streetAddress, city: prev.city, state: prev.state, zip: prev.zip,
      bedrooms: prev.bedrooms, bathrooms: prev.bathrooms, squareFeet: prev.squareFeet,
      units: prev.units, purchasePrice: prev.purchasePrice,
    }));
  }, []);

  const handleNumericChange = useCallback((field: keyof PropertyInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') { updateField(field, 0 as any); return; }
    const value = parseFloat(raw);
    if (!isNaN(value)) updateField(field, value as any);
  }, [updateField]);

  const handleStringChange = useCallback((field: keyof PropertyInputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateField(field, e.target.value as any);
  }, [updateField]);

  const autoCalcLoan = useCallback(() => {
    updateField('loanAmount', Math.round(inputs.purchasePrice * 0.75));
  }, [inputs.purchasePrice, updateField]);

  const handleFinancingToggle = useCallback((source: 'external' | 'covey_debt') => {
    if (source === 'covey_debt') {
      if (!coveyQualification.eligible) return;
      setInputs(prev => applyCoveyDebtTerms(prev, coveyQualification));
    } else {
      updateField('financingSource', 'external');
    }
  }, [coveyQualification, updateField]);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("properties")
      .insert({
        street_address: inputs.streetAddress,
        city: inputs.city,
        state: inputs.state,
        zip: inputs.zip,
        price: inputs.purchasePrice,
        image_url: '',
        cap_rate: results.capRate / 100,
        irr: results.irr / 100,
        equity_multiple: results.equityMultiple,
        type: inputs.type,
        fund_strategy: getFundForStrategy(inputs.type),
        bedrooms: inputs.bedrooms,
        bathrooms: inputs.bathrooms,
        square_feet: inputs.squareFeet,
        renovations: inputs.renovations,
        reserves: inputs.reserves,
        debt_costs: inputs.closingCosts,
        equity: results.totalEquityRequired,
        ltc: results.loanToCost,
        interest_rate: inputs.interestRate,
        amortization: inputs.amortizationYears,
        exit_cap_rate: inputs.exitCapRate,
        net_sale_proceeds: results.netSaleProceeds,
        profit_multiple: results.equityMultiple,
        in_place_rent: inputs.type === 'Long Term Rental' ? inputs.grossMonthlyRent : 0,
        stabilized_rent: inputs.type === 'Long Term Rental' ? inputs.grossMonthlyRent : 0,
        noi_margin: results.noiMargin / 100,
        dscr: results.dscr,
        financing_source: inputs.financingSource || 'external',
        spread: 0,
      })
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error("Error saving property:", error.message);
      setSaving(false);
      return;
    }

    // Save as primary scenario in Supabase
    await createScenario({
      propertyId: data.id,
      strategyType: toStrategyType(inputs.type),
      inputs,
      results,
      isPrimary: true,
    });

    setSaving(false);
    router.push(`/property/${data.id}`);
  };

  const sectionIndex = SECTIONS.findIndex(s => s.key === activeSection);
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === SECTIONS.length - 1;
  const goNext = () => { if (!isLast) setActiveSection(SECTIONS[sectionIndex + 1].key); };
  const goPrev = () => { if (!isFirst) setActiveSection(SECTIONS[sectionIndex - 1].key); };
  const hasInputs = inputs.purchasePrice > 0;

  const renderField = (label: string, field: keyof PropertyInputs, opts: { prefix?: string; suffix?: string; step?: string; placeholder?: string; type?: string; readOnly?: boolean } = {}) => {
    const isReadOnly = opts.readOnly || (isCovey && DEBT_FIELDS.has(field));
    const inputClass = `${styles.input} ${isReadOnly ? styles.fieldReadonly : ''}`;
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        {opts.prefix || opts.suffix ? (
          <div className={opts.prefix ? styles.inputWithPrefix : styles.inputWithSuffix}>
            {opts.prefix && <span className={styles.prefix}>{opts.prefix}</span>}
            <input className={inputClass} type={opts.type || "number"} step={opts.step} value={(inputs[field] as number) || ''} onChange={handleNumericChange(field)} placeholder={opts.placeholder} readOnly={isReadOnly} />
            {opts.suffix && <span className={styles.suffix}>{opts.suffix}</span>}
          </div>
        ) : (
          <input className={inputClass} type={opts.type || "number"} step={opts.step} value={(inputs[field] as number) || ''} onChange={handleNumericChange(field)} placeholder={opts.placeholder} readOnly={isReadOnly} />
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Underwrite a Deal</h1>
        <p className={styles.pageSubtitle}>Enter deal terms to analyze returns across all scenarios.</p>
      </div>

      <div className={styles.typeSelector}>
        {INVESTMENT_TYPES.map(t => {
          const fund = FUNDS[getFundForStrategy(t.value)];
          return (
            <button key={t.value} className={`${styles.typeButton} ${inputs.type === t.value ? styles.typeButtonActive : ''}`} onClick={() => handleTypeChange(t.value)}>
              <span className={styles.typeLabel}>{t.label}</span>
              <span className={styles.typeDesc}>{t.desc}</span>
              <span className={styles.typeFundTag} style={{ backgroundColor: fund.color }}>
                {fund.name.replace(' Fund', '')} ({fund.label})
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.formPanel}>
          <div className={styles.sectionNav}>
            {SECTIONS.map((s, i) => (
              <button key={s.key} className={`${styles.sectionTab} ${activeSection === s.key ? styles.sectionTabActive : ''} ${i < sectionIndex ? styles.sectionTabCompleted : ''}`} onClick={() => setActiveSection(s.key)}>
                <span className={styles.sectionNumber}>{i + 1}</span>
                <span className={styles.sectionLabel}>{s.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.formContent}>
            {/* PROPERTY INFO */}
            {activeSection === 'property' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Property Information</h2>
                <div className={styles.fieldGrid}>
                  <div className={styles.fieldFull}>
                    <label className={styles.label}>Street Address</label>
                    <input className={styles.input} value={inputs.streetAddress} onChange={handleStringChange('streetAddress')} placeholder="123 Main St" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>City</label>
                    <input className={styles.input} value={inputs.city} onChange={handleStringChange('city')} placeholder="Atlanta" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>State</label>
                    <input className={styles.input} value={inputs.state} onChange={handleStringChange('state')} placeholder="GA" maxLength={2} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>ZIP</label>
                    <input className={styles.input} value={inputs.zip} onChange={handleStringChange('zip')} placeholder="30318" />
                  </div>
                  {renderField('Bedrooms', 'bedrooms')}
                  {renderField('Bathrooms', 'bathrooms')}
                  {renderField('Square Feet', 'squareFeet')}
                  {renderField('Units', 'units')}
                </div>
              </div>
            )}

            {/* ACQUISITION */}
            {activeSection === 'acquisition' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Sources & Uses</h2>
                <div className={styles.fieldGrid}>
                  {renderField('Purchase Price', 'purchasePrice', { prefix: '$', placeholder: '325000' })}
                  {renderField('Closing Costs', 'closingCosts', { prefix: '$' })}
                  {renderField('Renovations', 'renovations', { prefix: '$' })}
                  {renderField('Reserves', 'reserves', { prefix: '$' })}
                  {inputs.type === 'Fix and Flip' && renderField('After Repair Value (ARV)', 'afterRepairValue', { prefix: '$' })}
                </div>
                {inputs.purchasePrice > 0 && (
                  <div className={styles.computedRow}><span>Total Project Cost</span><strong>{formatCurrency(results.totalProjectCost)}</strong></div>
                )}
              </div>
            )}

            {/* DEBT */}
            {activeSection === 'debt' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Debt Terms</h2>

                {/* Financing Source Toggle */}
                <div className={styles.financingToggle}>
                  <button
                    className={`${styles.financingOption} ${!isCovey ? styles.financingOptionActive : ''}`}
                    onClick={() => handleFinancingToggle('external')}
                  >
                    External Lender
                  </button>
                  <button
                    className={`${styles.financingOption} ${isCovey ? styles.financingOptionActive : ''}`}
                    onClick={() => handleFinancingToggle('covey_debt')}
                    disabled={!coveyQualification.eligible && !isCovey}
                  >
                    Covey Debt Fund
                  </button>
                </div>

                {/* Qualification Badge */}
                {inputs.purchasePrice > 0 && (
                  <div className={`${styles.qualBadge} ${coveyQualification.eligible ? styles.qualBadgeEligible : styles.qualBadgeIneligible}`}>
                    {coveyQualification.eligible
                      ? `Covey Eligible${coveyQualification.dscrTier ? ` — ${coveyQualification.dscrTier}` : ''}`
                      : `Covey Ineligible — ${coveyQualification.reason}`
                    }
                  </div>
                )}

                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Loan Amount
                      {inputs.purchasePrice > 0 && !isCovey && <button className={styles.autoCalc} onClick={autoCalcLoan}>Auto 75% LTV</button>}
                    </label>
                    <div className={styles.inputWithPrefix}>
                      <span className={styles.prefix}>$</span>
                      <input className={`${styles.input} ${isCovey ? styles.fieldReadonly : ''}`} type="number" value={inputs.loanAmount || ''} onChange={handleNumericChange('loanAmount')} readOnly={isCovey} />
                    </div>
                  </div>
                  {renderField('Interest Rate', 'interestRate', { suffix: '%', step: '0.1' })}
                  {renderField('Loan Term', 'loanTermYears', { suffix: 'yrs' })}
                  {renderField('Amortization', 'amortizationYears', { suffix: 'yrs' })}
                  <div className={styles.fieldFull}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={inputs.interestOnly} onChange={(e) => updateField('interestOnly', e.target.checked)} disabled={isCovey} />
                      Interest Only
                    </label>
                  </div>
                </div>
                {inputs.loanAmount > 0 && (
                  <div className={styles.computedGroup}>
                    <div className={styles.computedRow}><span>Monthly Payment</span><strong>{formatCurrency(results.monthlyDebtService)}</strong></div>
                    <div className={styles.computedRow}><span>Annual Debt Service</span><strong>{formatCurrency(results.annualDebtService)}</strong></div>
                    <div className={styles.computedRow}><span>Equity Required</span><strong>{formatCurrency(results.totalEquityRequired)}</strong></div>
                    <div className={styles.computedRow}><span>LTV / LTC</span><strong>{formatPercent(results.loanToValue)} / {formatPercent(results.loanToCost)}</strong></div>
                  </div>
                )}
              </div>
            )}

            {/* INCOME */}
            {activeSection === 'income' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {inputs.type === 'Short Term Rental' ? 'STR Revenue' : inputs.type === 'Fix and Flip' ? 'Project Timeline' : 'Rental Income'}
                </h2>
                <div className={styles.fieldGrid}>
                  {inputs.type === 'Short Term Rental' && (<>
                    {renderField('Avg Nightly Rate', 'avgNightlyRate', { prefix: '$' })}
                    {renderField('Occupancy Rate', 'occupancyRate', { suffix: '%' })}
                    {renderField('Cleaning Fee / Stay', 'cleaningFeePerStay', { prefix: '$' })}
                    {renderField('Avg Stay Duration', 'avgStayDuration', { suffix: 'nights' })}
                  </>)}
                  {inputs.type === 'Fix and Flip' && (<>
                    {renderField('Months to Complete', 'monthsToComplete')}
                    {renderField('Monthly Holding Costs', 'holdingCostsMonthly', { prefix: '$' })}
                  </>)}
                  {inputs.type === 'Long Term Rental' && (<>
                    {renderField('Gross Monthly Rent', 'grossMonthlyRent', { prefix: '$' })}
                    {renderField('Other Monthly Income', 'otherMonthlyIncome', { prefix: '$' })}
                    {renderField('Vacancy Rate', 'vacancyRate', { suffix: '%', step: '0.5' })}
                  </>)}
                </div>
                {hasInputs && inputs.type !== 'Fix and Flip' && (
                  <div className={styles.computedGroup}>
                    <div className={styles.computedRow}><span>Gross Scheduled Income</span><strong>{formatCurrency(results.grossScheduledIncome)}</strong></div>
                    <div className={styles.computedRow}><span>Effective Gross Income</span><strong>{formatCurrency(results.effectiveGrossIncome)}</strong></div>
                  </div>
                )}
              </div>
            )}

            {/* EXPENSES */}
            {activeSection === 'expenses' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Operating Expenses</h2>
                <p className={styles.sectionHint}>All values are annual amounts.</p>
                <div className={styles.fieldGrid}>
                  {renderField('Property Taxes', 'propertyTaxes', { prefix: '$' })}
                  {renderField('Insurance', 'insurance', { prefix: '$' })}
                  {renderField('Maintenance / Repairs', 'maintenance', { prefix: '$' })}
                  {inputs.type === 'Short Term Rental' ? (<>
                    {renderField('Platform Fee', 'strPlatformFee', { suffix: '%', step: '0.5' })}
                    {renderField('STR Management', 'strManagement', { suffix: '%', step: '0.5' })}
                  </>) : (
                    renderField('Property Management', 'management', { prefix: '$' })
                  )}
                  {renderField('Utilities', 'utilities', { prefix: '$' })}
                  {renderField('Other Expenses', 'otherExpenses', { prefix: '$' })}
                </div>
                {hasInputs && (
                  <div className={styles.computedGroup}>
                    <div className={styles.computedRow}><span>Total Operating Expenses</span><strong>{formatCurrency(results.totalOperatingExpenses)}</strong></div>
                    <div className={styles.computedRow}><span>Expense Ratio</span><strong>{formatPercent(results.expenseRatio)}</strong></div>
                    <div className={styles.computedRow}><span>NOI</span><strong className={results.noi >= 0 ? styles.positive : styles.negative}>{formatCurrency(results.noi)}</strong></div>
                  </div>
                )}
              </div>
            )}

            {/* DISPOSITION */}
            {activeSection === 'disposition' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>{inputs.type === 'Fix and Flip' ? 'Sale Strategy' : 'Exit Strategy'}</h2>
                <div className={styles.fieldGrid}>
                  {inputs.type !== 'Fix and Flip' && (<>
                    {renderField('Hold Period', 'holdPeriodYears', { suffix: 'yrs' })}
                    {renderField('Annual Appreciation', 'annualAppreciation', { suffix: '%', step: '0.5' })}
                    {renderField('Annual Rent Growth', 'annualRentGrowth', { suffix: '%', step: '0.5' })}
                    {renderField('Exit Cap Rate', 'exitCapRate', { suffix: '%', step: '0.25' })}
                  </>)}
                  {renderField('Selling Costs', 'sellingCosts', { suffix: '%', step: '0.5' })}
                </div>
                {hasInputs && (
                  <div className={styles.computedGroup}>
                    <div className={styles.computedRow}><span>Projected Sale Price</span><strong>{formatCurrency(results.projectedSalePrice)}</strong></div>
                    <div className={styles.computedRow}><span>Net Sale Proceeds</span><strong className={results.netSaleProceeds >= 0 ? styles.positive : styles.negative}>{formatCurrency(results.netSaleProceeds)}</strong></div>
                    <div className={styles.computedRow}><span>Total Profit</span><strong className={results.totalProfit >= 0 ? styles.positive : styles.negative}>{formatCurrency(results.totalProfit)}</strong></div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.formNav}>
              <button className={styles.navButton} onClick={goPrev} disabled={isFirst}>← Previous</button>
              {isLast ? (
                <button className={styles.submitButton} onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save & View Deal Summary →'}</button>
              ) : (
                <button className={styles.navButton} onClick={goNext}>Next →</button>
              )}
            </div>
          </div>
        </div>

        {/* LIVE METRICS SIDEBAR */}
        <div className={styles.metricsPanel}>
          <h3 className={styles.metricsTitle}>Live Returns</h3>
          {!hasInputs ? (
            <p className={styles.metricsHint}>Enter a purchase price to see live calculations.</p>
          ) : (<>
            <div className={styles.metricCard}><span className={styles.metricLabel}>IRR</span><span className={`${styles.metricValue} ${styles.metricLarge}`}>{formatPercent(results.irr)}</span></div>
            <div className={styles.metricCard}><span className={styles.metricLabel}>Cash-on-Cash</span><span className={`${styles.metricValue} ${styles.metricLarge}`}>{formatPercent(results.cashOnCash)}</span></div>
            <div className={styles.metricCard}><span className={styles.metricLabel}>Cap Rate</span><span className={styles.metricValue}>{formatPercent(results.capRate)}</span></div>
            <div className={styles.metricCard}><span className={styles.metricLabel}>Equity Multiple</span><span className={styles.metricValue}>{formatMultiple(results.equityMultiple)}</span></div>
            <div className={styles.metricCard}><span className={styles.metricLabel}>DSCR</span><span className={`${styles.metricValue} ${results.dscr < 1.2 && results.dscr > 0 ? styles.warning : ''}`}>{results.dscr.toFixed(2)}x</span></div>
            <div className={styles.metricDivider} />
            <div className={styles.metricCard}><span className={styles.metricLabel}>NOI</span><span className={`${styles.metricValue} ${results.noi < 0 ? styles.negative : ''}`}>{formatCurrency(results.noi)}</span></div>
            <div className={styles.metricCard}><span className={styles.metricLabel}>Monthly Cash Flow</span><span className={`${styles.metricValue} ${results.monthlyCashFlow < 0 ? styles.negative : ''}`}>{formatCurrency(results.monthlyCashFlow)}</span></div>
            <div className={styles.metricCard}><span className={styles.metricLabel}>Total Equity Required</span><span className={styles.metricValue}>{formatCurrency(results.totalEquityRequired)}</span></div>
            {inputs.type === 'Fix and Flip' && results.flipProfit !== undefined && (<>
              <div className={styles.metricDivider} />
              <div className={styles.metricCard}><span className={styles.metricLabel}>Flip Profit</span><span className={`${styles.metricValue} ${(results.flipProfit || 0) < 0 ? styles.negative : styles.positive}`}>{formatCurrency(results.flipProfit || 0)}</span></div>
              <div className={styles.metricCard}><span className={styles.metricLabel}>Flip ROI</span><span className={styles.metricValue}>{formatPercent(results.flipROI || 0)}</span></div>
            </>)}
            {inputs.type === 'Short Term Rental' && results.revenuePerAvailableNight !== undefined && (<>
              <div className={styles.metricDivider} />
              <div className={styles.metricCard}><span className={styles.metricLabel}>RevPAN</span><span className={styles.metricValue}>{formatCurrency(results.revenuePerAvailableNight)}</span></div>
            </>)}
          </>)}
        </div>
      </div>
    </div>
  );
}
