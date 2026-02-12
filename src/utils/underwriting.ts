// ============================================================
// Covey V2 — Underwriting Engine
// Pure calculation functions for real estate deal analysis
// Supports: Long Term Hold, Fix and Flip, Short Term Rental
// ============================================================

export type InvestmentType = 'Long Term Hold' | 'Fix and Flip' | 'Short Term Rental';

// ---- Input Types ----

export interface PropertyInputs {
  // Property Info
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  type: InvestmentType;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  units: number;
  imageUrl?: string;

  // Acquisition
  purchasePrice: number;
  closingCosts: number;
  renovations: number;
  reserves: number;

  // Debt Terms
  loanAmount: number;
  interestRate: number; // annual, e.g. 6.5
  loanTermYears: number;
  amortizationYears: number;
  interestOnly: boolean;

  // Income
  grossMonthlyRent: number;
  otherMonthlyIncome: number;
  vacancyRate: number; // e.g. 5 for 5%

  // Expenses
  propertyTaxes: number; // annual
  insurance: number; // annual
  maintenance: number; // annual
  management: number; // annual
  utilities: number; // annual
  otherExpenses: number; // annual

  // Disposition (Long Term Hold & STR)
  holdPeriodYears: number;
  annualAppreciation: number; // e.g. 3 for 3%
  annualRentGrowth: number; // e.g. 2 for 2%
  sellingCosts: number; // percentage, e.g. 6 for 6%
  exitCapRate: number; // e.g. 7 for 7%

  // Fix and Flip specific
  afterRepairValue: number;
  monthsToComplete: number;
  holdingCostsMonthly: number;

  // Short Term Rental specific
  avgNightlyRate: number;
  occupancyRate: number; // e.g. 70 for 70%
  cleaningFeePerStay: number;
  avgStayDuration: number; // nights
  strPlatformFee: number; // percentage, e.g. 3
  strManagement: number; // percentage, e.g. 20
}

// ---- Output Types ----

export interface UnderwritingResults {
  // Sources & Uses
  totalProjectCost: number;
  totalEquityRequired: number;
  loanToValue: number;
  loanToCost: number;

  // Annual Income
  grossScheduledIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;

  // Annual Expenses
  totalOperatingExpenses: number;
  expenseRatio: number;

  // Net Operating Income
  noi: number;
  noiMargin: number;

  // Debt Service
  annualDebtService: number;
  monthlyDebtService: number;

  // Cash Flow
  cashFlowBeforeDebt: number;
  cashFlowAfterDebt: number;
  monthlyCashFlow: number;

  // Return Metrics
  capRate: number;
  cashOnCash: number;
  dscr: number;
  equityMultiple: number;
  irr: number;
  totalProfit: number;
  annualizedReturn: number;

  // Disposition
  projectedSalePrice: number;
  netSaleProceeds: number;
  loanBalance: number;

  // Per Unit
  pricePerUnit: number;
  rentPerUnit: number;
  noiPerUnit: number;

  // Year-by-year projections
  yearlyProjections: YearProjection[];

  // Fix & Flip specific
  flipProfit?: number;
  flipROI?: number;
  flipAnnualizedROI?: number;

  // STR specific
  revenuePerAvailableNight?: number;
  averageDailyRate?: number;
}

export interface YearProjection {
  year: number;
  grossIncome: number;
  operatingExpenses: number;
  noi: number;
  debtService: number;
  cashFlow: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  cumulativeCashFlow: number;
}

// ============================================================
// Core Calculation Functions
// ============================================================

/**
 * Calculate monthly mortgage payment (P&I)
 */
export function calcMonthlyPayment(
  principal: number,
  annualRate: number,
  amortYears: number,
  interestOnly: boolean
): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;

  if (interestOnly) {
    return principal * monthlyRate;
  }

  if (monthlyRate === 0) return principal / (amortYears * 12);

  const n = amortYears * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
    (Math.pow(1 + monthlyRate, n) - 1);
}

/**
 * Calculate remaining loan balance after N years
 */
export function calcLoanBalance(
  principal: number,
  annualRate: number,
  amortYears: number,
  yearsElapsed: number,
  interestOnly: boolean
): number {
  if (principal <= 0) return 0;
  if (interestOnly) return principal;

  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal - (principal / (amortYears * 12)) * (yearsElapsed * 12);
  }

  const n = amortYears * 12;
  const p = yearsElapsed * 12;
  const payment = calcMonthlyPayment(principal, annualRate, amortYears, false);

  return principal * Math.pow(1 + monthlyRate, p) -
    payment * ((Math.pow(1 + monthlyRate, p) - 1) / monthlyRate);
}

/**
 * Calculate IRR using Newton's method
 */
export function calcIRR(cashFlows: number[], maxIterations = 1000, tolerance = 0.00001): number {
  if (cashFlows.length < 2) return 0;

  let rate = 0.1; // initial guess 10%

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
    }

    if (Math.abs(dnpv) < 1e-10) break;

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;

    // Guard against divergence
    if (rate < -0.99 || rate > 10) {
      return 0;
    }
  }

  return rate;
}

// ============================================================
// Main Underwriting Function
// ============================================================

export function runUnderwriting(inputs: PropertyInputs): UnderwritingResults {
  const {
    type,
    units,
    purchasePrice,
    closingCosts,
    renovations,
    reserves,
    loanAmount,
    interestRate,
    loanTermYears,
    amortizationYears,
    interestOnly,
    grossMonthlyRent,
    otherMonthlyIncome,
    vacancyRate,
    propertyTaxes,
    insurance,
    maintenance,
    management,
    utilities,
    otherExpenses,
    holdPeriodYears,
    annualAppreciation,
    annualRentGrowth,
    sellingCosts,
    exitCapRate,
    afterRepairValue,
    monthsToComplete,
    holdingCostsMonthly,
    avgNightlyRate,
    occupancyRate,
    cleaningFeePerStay,
    avgStayDuration,
    strPlatformFee,
    strManagement,
  } = inputs;

  const unitCount = Math.max(units, 1);

  // ---- Sources & Uses ----
  const totalProjectCost = purchasePrice + closingCosts + renovations + reserves;
  const totalEquityRequired = totalProjectCost - loanAmount;
  const loanToValue = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;
  const loanToCost = totalProjectCost > 0 ? (loanAmount / totalProjectCost) * 100 : 0;

  // ---- Income Calculation ----
  let grossScheduledIncome: number;

  if (type === 'Short Term Rental') {
    const totalNightsPerYear = 365;
    const occupiedNights = totalNightsPerYear * (occupancyRate / 100);
    const numberOfStays = avgStayDuration > 0 ? occupiedNights / avgStayDuration : 0;
    const nightlyRevenue = occupiedNights * avgNightlyRate;
    const cleaningRevenue = numberOfStays * cleaningFeePerStay;
    grossScheduledIncome = nightlyRevenue + cleaningRevenue;
  } else {
    grossScheduledIncome = (grossMonthlyRent + otherMonthlyIncome) * 12;
  }

  const vacancyLoss = type === 'Short Term Rental'
    ? 0 // already factored into occupancy rate
    : grossScheduledIncome * (vacancyRate / 100);
  const effectiveGrossIncome = grossScheduledIncome - vacancyLoss;

  // ---- Expenses ----
  let totalOperatingExpenses: number;

  if (type === 'Short Term Rental') {
    const platformFees = grossScheduledIncome * (strPlatformFee / 100);
    const strMgmt = grossScheduledIncome * (strManagement / 100);
    totalOperatingExpenses = propertyTaxes + insurance + maintenance + utilities + otherExpenses + platformFees + strMgmt;
  } else {
    totalOperatingExpenses = propertyTaxes + insurance + maintenance + management + utilities + otherExpenses;
  }

  const expenseRatio = effectiveGrossIncome > 0
    ? (totalOperatingExpenses / effectiveGrossIncome) * 100
    : 0;

  // ---- NOI ----
  const noi = effectiveGrossIncome - totalOperatingExpenses;
  const noiMargin = effectiveGrossIncome > 0 ? (noi / effectiveGrossIncome) * 100 : 0;

  // ---- Debt Service ----
  const monthlyDebtService = calcMonthlyPayment(loanAmount, interestRate, amortizationYears, interestOnly);
  const annualDebtService = monthlyDebtService * 12;

  // ---- Cash Flow ----
  const cashFlowBeforeDebt = noi;
  const cashFlowAfterDebt = noi - annualDebtService;
  const monthlyCashFlow = cashFlowAfterDebt / 12;

  // ---- Return Metrics ----
  const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
  const cashOnCash = totalEquityRequired > 0 ? (cashFlowAfterDebt / totalEquityRequired) * 100 : 0;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

  // ---- Per Unit ----
  const pricePerUnit = purchasePrice / unitCount;
  const rentPerUnit = grossMonthlyRent / unitCount;
  const noiPerUnit = noi / unitCount;

  // ---- Fix and Flip Specific ----
  let flipProfit: number | undefined;
  let flipROI: number | undefined;
  let flipAnnualizedROI: number | undefined;

  if (type === 'Fix and Flip') {
    const totalFlipCost = purchasePrice + closingCosts + renovations +
      (holdingCostsMonthly * monthsToComplete) +
      (annualDebtService / 12 * monthsToComplete);
    const sellCosts = afterRepairValue * (sellingCosts / 100);
    flipProfit = afterRepairValue - sellCosts - totalFlipCost;
    flipROI = totalEquityRequired > 0 ? (flipProfit / totalEquityRequired) * 100 : 0;
    const yearsToComplete = monthsToComplete / 12;
    flipAnnualizedROI = yearsToComplete > 0
      ? (Math.pow(1 + flipROI / 100, 1 / yearsToComplete) - 1) * 100
      : 0;
  }

  // ---- STR Specific ----
  const revenuePerAvailableNight = type === 'Short Term Rental'
    ? grossScheduledIncome / 365
    : undefined;
  const averageDailyRate = type === 'Short Term Rental'
    ? avgNightlyRate
    : undefined;

  // ---- Year-by-Year Projections ----
  const holdYears = type === 'Fix and Flip'
    ? Math.max(1, Math.ceil(monthsToComplete / 12))
    : holdPeriodYears;

  const yearlyProjections: YearProjection[] = [];
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= holdYears; year++) {
    const rentGrowthFactor = Math.pow(1 + annualRentGrowth / 100, year - 1);
    const appreciationFactor = Math.pow(1 + annualAppreciation / 100, year);

    let yearIncome: number;
    if (type === 'Short Term Rental') {
      yearIncome = grossScheduledIncome * rentGrowthFactor;
    } else if (type === 'Fix and Flip') {
      yearIncome = 0; // no rental income during flip
    } else {
      yearIncome = grossScheduledIncome * rentGrowthFactor;
    }

    const yearVacancy = type === 'Short Term Rental' ? 0 : yearIncome * (vacancyRate / 100);
    const yearEGI = yearIncome - yearVacancy;

    // Expenses grow at 2% per year (standard assumption)
    const expenseGrowth = Math.pow(1.02, year - 1);
    const yearExpenses = totalOperatingExpenses * expenseGrowth;

    const yearNOI = yearEGI - yearExpenses;
    const yearDebtService = annualDebtService;
    const yearCashFlow = type === 'Fix and Flip' ? -holdingCostsMonthly * 12 : yearNOI - yearDebtService;
    cumulativeCashFlow += yearCashFlow;

    const propertyValue = type === 'Fix and Flip'
      ? afterRepairValue
      : purchasePrice * appreciationFactor;

    const yearLoanBalance = calcLoanBalance(loanAmount, interestRate, amortizationYears, year, interestOnly);
    const yearEquity = propertyValue - yearLoanBalance;

    yearlyProjections.push({
      year,
      grossIncome: yearIncome,
      operatingExpenses: yearExpenses,
      noi: yearNOI,
      debtService: yearDebtService,
      cashFlow: yearCashFlow,
      propertyValue,
      loanBalance: yearLoanBalance,
      equity: yearEquity,
      cumulativeCashFlow,
    });
  }

  // ---- Disposition ----
  let projectedSalePrice: number;

  if (type === 'Fix and Flip') {
    projectedSalePrice = afterRepairValue;
  } else if (exitCapRate > 0 && holdYears > 0) {
    // Terminal value based on forward NOI / exit cap rate
    const terminalNOI = yearlyProjections[holdYears - 1]?.noi || noi;
    const terminalNOIForward = terminalNOI * (1 + annualRentGrowth / 100);
    projectedSalePrice = terminalNOIForward / (exitCapRate / 100);
  } else {
    projectedSalePrice = purchasePrice * Math.pow(1 + annualAppreciation / 100, holdYears);
  }

  const sellCostsAmount = projectedSalePrice * (sellingCosts / 100);
  const loanBalance = holdYears > 0
    ? calcLoanBalance(loanAmount, interestRate, amortizationYears, holdYears, interestOnly)
    : loanAmount;
  const netSaleProceeds = projectedSalePrice - sellCostsAmount - loanBalance;

  // ---- IRR Calculation ----
  const irrCashFlows: number[] = [-totalEquityRequired];

  if (type === 'Fix and Flip') {
    // For flips: negative equity upfront, profit at sale
    for (let i = 0; i < holdYears - 1; i++) {
      irrCashFlows.push(yearlyProjections[i]?.cashFlow || 0);
    }
    irrCashFlows.push((yearlyProjections[holdYears - 1]?.cashFlow || 0) + netSaleProceeds);
  } else {
    for (let i = 0; i < holdYears; i++) {
      if (i === holdYears - 1) {
        irrCashFlows.push((yearlyProjections[i]?.cashFlow || 0) + netSaleProceeds);
      } else {
        irrCashFlows.push(yearlyProjections[i]?.cashFlow || 0);
      }
    }
  }

  const irr = calcIRR(irrCashFlows) * 100;

  // ---- Equity Multiple ----
  const totalCashReceived = cumulativeCashFlow + netSaleProceeds;
  const equityMultiple = totalEquityRequired > 0
    ? totalCashReceived / totalEquityRequired
    : 0;

  const totalProfit = totalCashReceived - totalEquityRequired;
  const annualizedReturn = holdYears > 0
    ? (Math.pow(equityMultiple, 1 / holdYears) - 1) * 100
    : 0;

  return {
    totalProjectCost,
    totalEquityRequired,
    loanToValue,
    loanToCost,
    grossScheduledIncome,
    vacancyLoss,
    effectiveGrossIncome,
    totalOperatingExpenses,
    expenseRatio,
    noi,
    noiMargin,
    annualDebtService,
    monthlyDebtService,
    cashFlowBeforeDebt,
    cashFlowAfterDebt,
    monthlyCashFlow,
    capRate,
    cashOnCash,
    dscr,
    equityMultiple,
    irr,
    totalProfit,
    annualizedReturn,
    projectedSalePrice,
    netSaleProceeds,
    loanBalance,
    pricePerUnit,
    rentPerUnit,
    noiPerUnit,
    yearlyProjections,
    flipProfit,
    flipROI,
    flipAnnualizedROI,
    revenuePerAvailableNight,
    averageDailyRate,
  };
}

// ============================================================
// Default Inputs by Type
// ============================================================

export function getDefaultInputs(type: InvestmentType): PropertyInputs {
  const base: PropertyInputs = {
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    type,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    units: 1,
    imageUrl: '',
    purchasePrice: 0,
    closingCosts: 0,
    renovations: 0,
    reserves: 0,
    loanAmount: 0,
    interestRate: 7.0,
    loanTermYears: 30,
    amortizationYears: 30,
    interestOnly: false,
    grossMonthlyRent: 0,
    otherMonthlyIncome: 0,
    vacancyRate: 5,
    propertyTaxes: 0,
    insurance: 0,
    maintenance: 0,
    management: 0,
    utilities: 0,
    otherExpenses: 0,
    holdPeriodYears: 5,
    annualAppreciation: 3,
    annualRentGrowth: 2,
    sellingCosts: 6,
    exitCapRate: 7,
    afterRepairValue: 0,
    monthsToComplete: 6,
    holdingCostsMonthly: 0,
    avgNightlyRate: 0,
    occupancyRate: 70,
    cleaningFeePerStay: 0,
    avgStayDuration: 3,
    strPlatformFee: 3,
    strManagement: 20,
  };

  if (type === 'Fix and Flip') {
    base.interestRate = 10;
    base.loanTermYears = 1;
    base.amortizationYears = 30;
    base.interestOnly = true;
    base.holdPeriodYears = 1;
  }

  if (type === 'Short Term Rental') {
    base.holdPeriodYears = 5;
    base.vacancyRate = 0; // handled by occupancy rate
  }

  return base;
}

// ============================================================
// Formatting Helpers
// ============================================================

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}
