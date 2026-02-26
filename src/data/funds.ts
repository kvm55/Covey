export type FundStrategy = 'bobwhite' | 'pheasant' | 'chukar' | 'woodcock' | 'grouse';

export interface FundConfig {
  id: FundStrategy;
  name: string;
  bird: string;
  label: string;
  color: string;
  riskLevel: 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';
  description: string;
  strategySummary: string;
}

export const FUNDS: Record<FundStrategy, FundConfig> = {
  bobwhite: {
    id: 'bobwhite',
    name: 'Bobwhite Fund',
    bird: 'Bobwhite Quail',
    label: 'Income',
    color: '#2D4A2D',
    riskLevel: 'Low',
    description: 'Stable, income-producing workforce housing with long-term Section 8 tenants.',
    strategySummary: 'Cash flow-first strategy targeting stabilized assets with reliable government-backed rental income.',
  },
  pheasant: {
    id: 'pheasant',
    name: 'Pheasant Fund',
    bird: 'Ring-Necked Pheasant',
    label: 'Balanced',
    color: '#3D6B3D',
    riskLevel: 'Low-Medium',
    description: 'Balanced long-term holds blending steady income with moderate appreciation.',
    strategySummary: 'Core-plus strategy combining stable rental yield with upside through light value-add and market growth.',
  },
  chukar: {
    id: 'chukar',
    name: 'Chukar Fund',
    bird: 'Chukar Partridge',
    label: 'Growth',
    color: '#D48B0A',
    riskLevel: 'Medium',
    description: 'Growth-oriented build-to-rent and development plays in high-demand corridors.',
    strategySummary: 'Development and BTR strategy targeting emerging markets with strong population and job growth.',
  },
  woodcock: {
    id: 'woodcock',
    name: 'Woodcock Fund',
    bird: 'American Woodcock',
    label: 'Impact',
    color: '#5A6E82',
    riskLevel: 'Medium-High',
    description: 'Impact-driven cohabitation and community-focused housing models.',
    strategySummary: 'Social impact strategy pairing shared-living models with community development for blended returns.',
  },
  grouse: {
    id: 'grouse',
    name: 'Grouse Fund',
    bird: 'Ruffed Grouse',
    label: 'Alpha',
    color: '#722F37',
    riskLevel: 'High',
    description: 'Opportunistic fix-and-flip and deep value-add plays targeting outsized returns.',
    strategySummary: 'Alpha-seeking strategy focused on distressed acquisitions, heavy rehab, and quick-turn dispositions.',
  },
};

export const FUND_LIST: FundConfig[] = Object.values(FUNDS);

const TYPE_TO_FUND: Record<string, FundStrategy> = {
  'workforce housing': 'bobwhite',
  'long term hold': 'pheasant',
  'short term rental': 'pheasant',
  'build to rent': 'chukar',
  'development': 'chukar',
  'cohabitation': 'woodcock',
  'value add': 'woodcock',
  'fix and flip': 'grouse',
};

export function getFundForStrategy(type: string): FundStrategy {
  const normalized = type.toLowerCase().trim();
  return TYPE_TO_FUND[normalized] ?? 'pheasant';
}
