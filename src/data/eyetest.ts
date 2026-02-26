import type {
  InvestorBreed,
  BreedScores,
  ABQuestion,
  SliderConfig,
  BreedProfile,
  FundAllocation,
  SliderValues,
} from '@/types/investor';
import type { FundStrategy } from '@/types/enums';

// ── A/B Questions (8 rounds) ──────────────────────────────────

export const AB_QUESTIONS: ABQuestion[] = [
  {
    id: 'q1_income_vs_appreciation',
    prompt: 'What are you building toward?',
    optionA: { label: 'Steady monthly income', description: 'Predictable cash flow you can count on every month' },
    optionB: { label: 'Long-term appreciation', description: 'Equity appreciation over long holds — your return is in the exit' },
    weights: {
      A: { setter: 3 },
      B: { gsp: 3, vizsla: 2 },
    },
  },
  {
    id: 'q2_ideal_deal',
    prompt: 'Your ideal deal looks like...',
    optionA: { label: 'Stabilized duplex', description: '$1,200/mo cash flow, tenants in place, boring and beautiful' },
    optionB: { label: 'Distressed fixer', description: '40% below market — needs work, but the upside is massive' },
    weights: {
      A: { setter: 2, boykin: 1 },
      B: { vizsla: 3 },
    },
  },
  {
    id: 'q3_holding_period',
    prompt: 'How long do you hold?',
    optionA: { label: '7+ years, buy and hold', description: 'Patience pays. Time is the asset.' },
    optionB: { label: 'Under 2 years, in and out', description: 'Quick turns, fast capital recycling, stack the next deal.' },
    weights: {
      A: { setter: 2, brittany: 2 },
      B: { vizsla: 3 },
    },
  },
  {
    id: 'q4_motivation',
    prompt: 'What\'s the thesis behind the capital?',
    optionA: { label: 'Financial independence', description: 'Building generational wealth and personal freedom' },
    optionB: { label: 'Building community wealth', description: 'Creating affordable housing and neighborhood impact' },
    weights: {
      A: { gsp: 2, vizsla: 1 },
      B: { boykin: 3 },
    },
  },
  {
    id: 'q5_vacancy_risk',
    prompt: 'Where do you land on vacancy risk?',
    optionA: { label: 'Zero tolerance', description: '100% Section 8 — guaranteed rent, government-backed' },
    optionB: { label: 'Trade vacancy for upside', description: 'I\'ll accept gaps if the rent ceiling is higher' },
    weights: {
      A: { setter: 2 },
      B: { brittany: 2, gsp: 2 },
    },
  },
  {
    id: 'q6_market_preference',
    prompt: 'Where do you want to deploy?',
    optionA: { label: 'Midwest — low basis, steady, overlooked', description: 'Low entry, steady yields, less competition' },
    optionB: { label: 'Sun Belt — growth, competition', description: 'Population booms, appreciation plays, higher cost of entry' },
    weights: {
      A: { setter: 2 },
      B: { gsp: 2, brittany: 1 },
    },
  },
  {
    id: 'q7_involvement',
    prompt: 'How close to the deals do you want to be?',
    optionA: { label: 'Fully passive, set and forget', description: 'You invest the capital; someone else handles the rest' },
    optionB: { label: 'Hands-on, I want the details', description: 'Underwrite every deal, pick every market, monitor metrics' },
    weights: {
      A: { setter: 1, brittany: 1 },
      B: { gsp: 2, vizsla: 2 },
    },
  },
  {
    id: 'q8_impact',
    prompt: 'Does impact matter to your investment thesis?',
    optionA: { label: 'Yes — ESG, workforce housing', description: 'Community outcomes and financial returns — weighted equally' },
    optionB: { label: 'Not a primary factor', description: 'Returns first. Impact is welcome but not weighted.' },
    weights: {
      A: { boykin: 3 },
      B: { gsp: 1, vizsla: 1, brittany: 1 },
    },
  },
];

// ── Slider Configurations (5 dimensions) ──────────────────────

function lerp(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

export const SLIDERS: SliderConfig[] = [
  {
    id: 'risk_tolerance',
    label: 'Risk Tolerance',
    description: 'How much volatility can you hold through?',
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 5,
    leftLabel: 'Conservative',
    rightLabel: 'Aggressive',
    weights: (value, min, max) => {
      const t = lerp(value, min, max);
      return {
        setter: 3 * (1 - t),
        boykin: 2 * (1 - t),
        gsp: 3 * t,
        vizsla: 3 * t,
      };
    },
  },
  {
    id: 'time_horizon',
    label: 'Time Horizon',
    description: 'How long before you need the capital back?',
    min: 1,
    max: 15,
    step: 1,
    defaultValue: 7,
    leftLabel: '1 year',
    rightLabel: '15 years',
    weights: (value, min, max) => {
      const t = lerp(value, min, max);
      return {
        vizsla: 3 * (1 - t),
        setter: 3 * t,
        brittany: 2 * t,
      };
    },
  },
  {
    id: 'min_yield',
    label: 'Minimum Acceptable Yield',
    description: 'What cash-on-cash return is your floor?',
    min: 0,
    max: 15,
    step: 1,
    defaultValue: 6,
    leftLabel: '0%',
    rightLabel: '15%',
    weights: (value, min, max) => {
      const t = lerp(value, min, max);
      return {
        gsp: 2 * (1 - t),
        vizsla: 2 * (1 - t),
        setter: 3 * t,
        boykin: 2 * t,
      };
    },
  },
  {
    id: 'liquidity_need',
    label: 'Liquidity Need',
    description: 'How quickly do you need access to this capital?',
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 3,
    leftLabel: 'Locked up is fine',
    rightLabel: 'Need access fast',
    weights: (value, min, max) => {
      const t = lerp(value, min, max);
      return {
        setter: 2 * (1 - t),
        brittany: 2 * (1 - t),
        vizsla: 3 * t,
      };
    },
  },
  {
    id: 'impact_preference',
    label: 'Impact Preference',
    description: 'How much weight does community impact carry in your thesis?',
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 5,
    leftLabel: 'Returns only',
    rightLabel: 'Impact-driven',
    weights: (value, min, max) => {
      const t = lerp(value, min, max);
      return {
        gsp: 2 * (1 - t),
        vizsla: 2 * (1 - t),
        boykin: 3 * t,
      };
    },
  },
];

// ── Breed Profiles ────────────────────────────────────────────

export const BREED_PROFILES: Record<InvestorBreed, BreedProfile> = {
  setter: {
    breed: 'setter',
    name: 'The Setter',
    dogBreed: 'English Setter',
    fundMatch: 'bobwhite',
    tagline: 'Patient capital, steady returns',
    description:
      'You\'re the steady hand at the table. You value predictable cash flow over flashy returns, and you\'re willing to hold through market cycles because you know time compounds in your favor. Section 8 housing, stabilized assets, and long-term holds — that\'s the portfolio. You\'d rather collect rent than chase appreciation — and that discipline is your edge.',
    traits: ['Income-focused', 'Long-term holder', 'Low volatility', 'Passive investor', 'Yield-disciplined'],
    color: '#2D4A2D',
  },
  boykin: {
    breed: 'boykin',
    name: 'The Boykin',
    dogBreed: 'Boykin Spaniel',
    fundMatch: 'woodcock',
    tagline: 'Community first, returns follow',
    description:
      'Impact isn\'t a buzzword for you — it\'s the thesis. You believe the best investments solve real problems: affordable housing, workforce stability, lasting neighborhood value. You\'re drawn to strategies where financial returns and social outcomes aren\'t in tension. Values-aligned, mission-driven, and patient enough to let impact compound.',
    traits: ['Impact-driven', 'Values-aligned', 'Community builder', 'Workforce housing', 'Patient capital'],
    color: '#5A6E82',
  },
  brittany: {
    breed: 'brittany',
    name: 'The Brittany',
    dogBreed: 'Brittany Spaniel',
    fundMatch: 'pheasant',
    tagline: 'Balanced and versatile',
    description:
      'Income and growth. Safety and upside. You don\'t choose — you engineer the blend. Your portfolio balances yield and appreciation, and you size risk carefully across multiple markets. Diversification isn\'t a hedge for you; it\'s the strategy itself. Core-plus positioning, long time horizon. The balanced hand wins more often than the loud one.',
    traits: ['Risk-calibrated', 'Diversified', 'Core-plus', 'Multi-market', 'Disciplined growth'],
    color: '#3D6B3D',
  },
  gsp: {
    breed: 'gsp',
    name: 'The GSP',
    dogBreed: 'German Shorthaired Pointer',
    fundMatch: 'chukar',
    tagline: 'Driven growth, disciplined execution',
    description:
      'You see what others miss. Growth markets, development plays, build-to-rent corridors — you invest in trajectory, not history. You underwrite every deal yourself, monitor the macro, and aren\'t afraid to move fast when the numbers work. Data-driven, growth-oriented, and already underwriting the next market before consensus arrives.',
    traits: ['Growth-oriented', 'Data-driven', 'Thesis-driven', 'Development plays', 'Emerging markets'],
    color: '#D48B0A',
  },
  vizsla: {
    breed: 'vizsla',
    name: 'The Vizsla',
    dogBreed: 'Vizsla',
    fundMatch: 'grouse',
    tagline: 'First in, last out — maximum alpha',
    description:
      'You\'re the sharp end of the spear. Distressed assets, deep value-add, quick-turn flips — you thrive in dislocation because that\'s where the margin lives. Your holding period is measured in months, not years. Capital recycling, asymmetric returns, and the next distressed deal on the wire.',
    traits: ['Alpha-seeking', 'Opportunistic', 'Quick-turn', 'High conviction', 'Value-add specialist'],
    color: '#722F37',
  },
};

// ── Scoring Functions ─────────────────────────────────────────

const ALL_BREEDS: InvestorBreed[] = ['setter', 'boykin', 'brittany', 'gsp', 'vizsla'];

export function initialScores(): BreedScores {
  return { setter: 0, boykin: 0, brittany: 0, gsp: 0, vizsla: 0 };
}

export function applyABChoice(
  scores: BreedScores,
  question: ABQuestion,
  choice: 'A' | 'B',
): BreedScores {
  const weights = choice === 'A' ? question.weights.A : question.weights.B;
  const next = { ...scores };
  for (const breed of ALL_BREEDS) {
    next[breed] += weights[breed] ?? 0;
  }
  return next;
}

export function applySliderAdjustments(
  scores: BreedScores,
  sliders: SliderConfig[],
  values: SliderValues,
): BreedScores {
  const next = { ...scores };
  for (const slider of sliders) {
    const value = values[slider.id] ?? slider.defaultValue;
    const weights = slider.weights(value, slider.min, slider.max);
    for (const breed of ALL_BREEDS) {
      next[breed] += weights[breed] ?? 0;
    }
  }
  return next;
}

export function getWinningBreed(scores: BreedScores): InvestorBreed {
  let best: InvestorBreed = 'brittany';
  let bestScore = -Infinity;
  for (const breed of ALL_BREEDS) {
    if (scores[breed] > bestScore) {
      bestScore = scores[breed];
      best = breed;
    }
  }
  return best;
}

// ── Fund Allocation ───────────────────────────────────────────

const BREED_TO_FUND: Record<InvestorBreed, FundStrategy> = {
  setter: 'bobwhite',
  boykin: 'woodcock',
  brittany: 'pheasant',
  gsp: 'chukar',
  vizsla: 'grouse',
};

export function calculateFundAllocation(scores: BreedScores): FundAllocation[] {
  // Normalize breed scores to percentages
  const total = ALL_BREEDS.reduce((sum, b) => sum + Math.max(scores[b], 0), 0);
  if (total === 0) {
    // Fallback: equal split
    return [
      ...ALL_BREEDS.map((b) => ({ fund: BREED_TO_FUND[b] as FundStrategy | 'debt', percentage: 17 })),
      { fund: 'debt' as const, percentage: 15 },
    ];
  }

  const normalized: Record<InvestorBreed, number> = { setter: 0, boykin: 0, brittany: 0, gsp: 0, vizsla: 0 };
  for (const breed of ALL_BREEDS) {
    normalized[breed] = (Math.max(scores[breed], 0) / total) * 100;
  }

  // Determine debt carve-out based on income orientation
  // Income-oriented profiles (setter + boykin dominate) get 15–30%; growth/alpha get 5–10%
  const incomeWeight = normalized.setter + normalized.boykin;
  let debtPct: number;
  if (incomeWeight >= 50) {
    debtPct = 20 + (incomeWeight - 50) * 0.2; // 20–30%
  } else if (incomeWeight >= 30) {
    debtPct = 15; // baseline
  } else {
    debtPct = 5 + incomeWeight * 0.167; // 5–10%
  }
  debtPct = Math.round(debtPct);

  // Scale equity allocation to fill remaining
  const equityPct = 100 - debtPct;
  const allocations: FundAllocation[] = ALL_BREEDS.map((breed) => ({
    fund: BREED_TO_FUND[breed] as FundStrategy | 'debt',
    percentage: Math.round(normalized[breed] * equityPct / 100),
  }));

  // Add debt
  allocations.push({ fund: 'debt', percentage: debtPct });

  // Fix rounding so it sums to exactly 100
  const currentSum = allocations.reduce((s, a) => s + a.percentage, 0);
  if (currentSum !== 100) {
    // Adjust the largest equity allocation
    const largest = allocations
      .filter((a) => a.fund !== 'debt')
      .sort((a, b) => b.percentage - a.percentage)[0];
    largest.percentage += 100 - currentSum;
  }

  // Remove 0% allocations (except debt)
  return allocations.filter((a) => a.percentage > 0);
}
