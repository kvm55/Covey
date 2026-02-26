// ============================================================
// Covey Debt Fund — Lending Parameters & Qualification Logic
// Captive debt fund that lends to Covey equity fund deals
// ============================================================

import type { PropertyInputs, InvestmentType } from '@/utils/underwriting';

// ---- Types ----

export interface DebtFundTerms {
  maxLTV: number;       // e.g. 75 for 75%
  baseRate: number;     // annual rate, e.g. 8.0
  amortYears: number;   // 0 = IO only
  ioYears: number;      // interest-only period
  termYears: number;    // loan term
  termMonths?: number;  // for sub-year terms (Fix & Flip)
  interestOnly: boolean;
}

export interface DSCRSpreadTier {
  minDSCR: number;
  spreadBps: number; // basis points adjustment (negative = discount)
}

export interface DebtQualification {
  eligible: boolean;
  reason?: string;
  terms?: DebtFundTerms;
  adjustedRate?: number;
  dscrTier?: string;
}

// ---- Config by Deal Type ----

const COVEY_DEBT_TERMS: Record<InvestmentType, DebtFundTerms> = {
  'Long Term Rental': {
    maxLTV: 75,
    baseRate: 8.0,
    amortYears: 30,
    ioYears: 2,
    termYears: 5,
    interestOnly: false, // IO for first 2 years, then amortizing
  },
  'Fix and Flip': {
    maxLTV: 70,
    baseRate: 10.0,
    amortYears: 0, // IO only
    ioYears: 18, // full term
    termYears: 0,
    termMonths: 18,
    interestOnly: true,
  },
  'Short Term Rental': {
    maxLTV: 70,
    baseRate: 9.0,
    amortYears: 25,
    ioYears: 1,
    termYears: 5,
    interestOnly: false,
  },
};

// ---- DSCR Spread Tiers (LTR & STR only) ----

const DSCR_SPREAD_TIERS: DSCRSpreadTier[] = [
  { minDSCR: 1.5, spreadBps: -50 },
  { minDSCR: 1.3, spreadBps: -25 },
  { minDSCR: 1.1, spreadBps: 0 },
];

function getDSCRSpread(dscr: number, type: InvestmentType): { spreadBps: number; tier: string } | null {
  // Fix & Flip doesn't use DSCR-based pricing
  if (type === 'Fix and Flip') return { spreadBps: 0, tier: 'N/A' };

  for (const tier of DSCR_SPREAD_TIERS) {
    if (dscr >= tier.minDSCR) {
      const label = tier.spreadBps < 0
        ? `${tier.spreadBps}bps (DSCR >= ${tier.minDSCR}x)`
        : tier.spreadBps === 0
          ? `+0bps (DSCR >= ${tier.minDSCR}x)`
          : `+${tier.spreadBps}bps`;
      return { spreadBps: tier.spreadBps, tier: label };
    }
  }

  // Below 1.1x → ineligible
  return null;
}

// ---- Qualification Function ----

export function qualifyForCoveyDebt(
  inputs: PropertyInputs,
  noi: number,
): DebtQualification {
  const terms = COVEY_DEBT_TERMS[inputs.type];
  if (!terms) {
    return { eligible: false, reason: 'Unsupported investment type' };
  }

  // Check purchase price
  if (inputs.purchasePrice <= 0) {
    return { eligible: false, reason: 'Purchase price required' };
  }

  // Calculate max loan at Covey LTV
  const maxLoan = Math.round(inputs.purchasePrice * (terms.maxLTV / 100));
  if (maxLoan <= 0) {
    return { eligible: false, reason: 'Loan amount would be zero' };
  }

  // For LTR/STR, check DSCR eligibility
  // We need to compute what the DSCR would be under Covey terms
  if (inputs.type !== 'Fix and Flip') {
    // Estimate monthly payment under Covey terms for DSCR check
    const monthlyRate = terms.baseRate / 100 / 12;
    // During IO period, payment is interest-only
    const monthlyPayment = maxLoan * monthlyRate;
    const annualDebtService = monthlyPayment * 12;
    const estimatedDSCR = annualDebtService > 0 ? noi / annualDebtService : 0;

    const dscrResult = getDSCRSpread(estimatedDSCR, inputs.type);
    if (!dscrResult) {
      return {
        eligible: false,
        reason: `DSCR ${estimatedDSCR.toFixed(2)}x is below 1.1x minimum`,
      };
    }

    const adjustedRate = terms.baseRate + (dscrResult.spreadBps / 100);

    return {
      eligible: true,
      terms,
      adjustedRate,
      dscrTier: dscrResult.tier,
    };
  }

  // Fix & Flip — no DSCR check
  return {
    eligible: true,
    terms,
    adjustedRate: terms.baseRate,
    dscrTier: 'N/A',
  };
}

// ---- Apply Covey Debt Terms to Inputs ----

export function applyCoveyDebtTerms(
  inputs: PropertyInputs,
  qualification: DebtQualification,
): PropertyInputs {
  if (!qualification.eligible || !qualification.terms) return inputs;

  const terms = qualification.terms;
  const maxLoan = Math.round(inputs.purchasePrice * (terms.maxLTV / 100));

  return {
    ...inputs,
    financingSource: 'covey_debt',
    loanAmount: maxLoan,
    interestRate: qualification.adjustedRate ?? terms.baseRate,
    loanTermYears: terms.termMonths ? Math.ceil(terms.termMonths / 12) : terms.termYears,
    amortizationYears: terms.interestOnly ? 30 : terms.amortYears,
    interestOnly: terms.interestOnly,
  };
}

export { COVEY_DEBT_TERMS };
