import type { FundStrategy } from './enums';

// ── Breed System ──────────────────────────────────────────────
export type InvestorBreed = 'setter' | 'boykin' | 'brittany' | 'gsp' | 'vizsla';

export type BreedScores = Record<InvestorBreed, number>;

// ── Fund Allocation ───────────────────────────────────────────
export interface FundAllocation {
  fund: FundStrategy | 'debt';
  percentage: number; // 0-100
}

// ── A/B Questions ─────────────────────────────────────────────
export interface ABQuestion {
  id: string;
  prompt: string;
  optionA: { label: string; description: string };
  optionB: { label: string; description: string };
  weights: {
    A: Partial<BreedScores>;
    B: Partial<BreedScores>;
  };
}

// ── Sliders ───────────────────────────────────────────────────
export interface SliderConfig {
  id: string;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  leftLabel: string;
  rightLabel: string;
  weights: (value: number, min: number, max: number) => Partial<BreedScores>;
}

export interface SliderValues {
  [sliderId: string]: number;
}

// ── Breed Profiles ────────────────────────────────────────────
export interface BreedProfile {
  breed: InvestorBreed;
  name: string;        // "The Setter"
  dogBreed: string;    // "English Setter"
  fundMatch: FundStrategy;
  tagline: string;
  description: string;
  traits: string[];
  color: string;
}

// ── Database Row ──────────────────────────────────────────────
export interface InvestorProfileRow {
  id: string;
  user_id: string | null;
  breed: InvestorBreed;
  scores: BreedScores;
  responses: { ab: Record<string, 'A' | 'B'>; sliders: SliderValues };
  fund_allocation: FundAllocation[];
  created_at: string;
  updated_at: string;
}

// ── State Machine ─────────────────────────────────────────────
export type EyeTestStep = 'intro' | 'ab' | 'sliders' | 'reveal' | 'recommendation';
