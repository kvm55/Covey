import { createClient } from '@/utils/supabase';
import type { StrategyType } from '@/types/enums';
import type { UnderwritingScenarioRow } from '@/types/underwriting';
import type { PropertyInputs, UnderwritingResults, InvestmentType } from '@/utils/underwriting';
import { getFundForStrategy } from '@/data/funds';

// ── Strategy Type Mapping ─────────────────────────────────────

const DISPLAY_TO_STRATEGY: Record<InvestmentType, StrategyType> = {
  'Long Term Rental': 'long_term_rental',
  'Fix and Flip': 'fix_and_flip',
  'Short Term Rental': 'short_term_rental',
};

const STRATEGY_TO_DISPLAY: Record<StrategyType, InvestmentType> = {
  long_term_rental: 'Long Term Rental',
  fix_and_flip: 'Fix and Flip',
  short_term_rental: 'Short Term Rental',
};

const DEFAULT_SCENARIO_NAMES: Record<StrategyType, string> = {
  long_term_rental: 'Base Case — Long Term',
  fix_and_flip: 'Base Case — Flip',
  short_term_rental: 'Base Case — STR',
};

export function toStrategyType(displayType: InvestmentType): StrategyType {
  return DISPLAY_TO_STRATEGY[displayType];
}

export function toDisplayType(strategyType: StrategyType): InvestmentType {
  return STRATEGY_TO_DISPLAY[strategyType];
}

export function getDefaultScenarioName(strategyType: StrategyType): string {
  return DEFAULT_SCENARIO_NAMES[strategyType];
}

// ── CRUD Operations ───────────────────────────────────────────

export async function fetchScenarios(propertyId: string): Promise<UnderwritingScenarioRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('underwriting_scenarios')
    .select('*')
    .eq('property_id', propertyId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching scenarios:', error.message);
    return [];
  }
  return (data ?? []) as UnderwritingScenarioRow[];
}

export async function fetchPrimaryScenario(propertyId: string): Promise<UnderwritingScenarioRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('underwriting_scenarios')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_primary', true)
    .single();

  if (error) return null;
  return data as UnderwritingScenarioRow;
}

interface CreateScenarioParams {
  propertyId: string;
  name?: string;
  strategyType: StrategyType;
  inputs: PropertyInputs;
  results: UnderwritingResults;
  isPrimary?: boolean;
  unitId?: string;
}

export async function createScenario(params: CreateScenarioParams): Promise<UnderwritingScenarioRow | null> {
  const supabase = createClient();
  const {
    propertyId,
    name,
    strategyType,
    inputs,
    results,
    isPrimary = false,
    unitId,
  } = params;

  const scenarioName = name ?? getDefaultScenarioName(strategyType);

  // If this is primary, clear siblings first
  if (isPrimary) {
    await supabase
      .from('underwriting_scenarios')
      .update({ is_primary: false })
      .eq('property_id', propertyId);
  }

  const { data, error } = await supabase
    .from('underwriting_scenarios')
    .insert({
      property_id: propertyId,
      unit_id: unitId ?? null,
      name: scenarioName,
      strategy_type: strategyType,
      inputs: inputs as unknown as Record<string, unknown>,
      results: results as unknown as Record<string, unknown>,
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating scenario:', error.message);
    return null;
  }

  // Sync to properties table if this is the primary scenario
  if (isPrimary) {
    await syncPrimaryToProperty(propertyId, inputs, results);
  }

  return data as UnderwritingScenarioRow;
}

export async function updateScenario(
  scenarioId: string,
  updates: Partial<Pick<UnderwritingScenarioRow, 'name' | 'inputs' | 'results' | 'strategy_type'>>
): Promise<UnderwritingScenarioRow | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('underwriting_scenarios')
    .update(updates as Record<string, unknown>)
    .eq('id', scenarioId)
    .select()
    .single();

  if (error) {
    console.error('Error updating scenario:', error.message);
    return null;
  }

  const row = data as UnderwritingScenarioRow;

  // If this is the primary scenario, sync to properties
  if (row.is_primary && row.inputs && row.results) {
    await syncPrimaryToProperty(
      row.property_id,
      row.inputs as PropertyInputs,
      row.results as UnderwritingResults,
    );
  }

  return row;
}

export async function deleteScenario(scenarioId: string): Promise<boolean> {
  const supabase = createClient();

  // Fetch the scenario to check if it's primary
  const { data: scenario } = await supabase
    .from('underwriting_scenarios')
    .select('*')
    .eq('id', scenarioId)
    .single();

  if (!scenario) return false;

  const wasPrimary = scenario.is_primary;
  const propertyId = scenario.property_id;

  const { error } = await supabase
    .from('underwriting_scenarios')
    .delete()
    .eq('id', scenarioId);

  if (error) {
    console.error('Error deleting scenario:', error.message);
    return false;
  }

  // If it was primary, promote the next oldest
  if (wasPrimary) {
    const { data: remaining } = await supabase
      .from('underwriting_scenarios')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (remaining && remaining.length > 0) {
      await promoteScenario(remaining[0].id);
    }
  }

  return true;
}

export async function promoteScenario(scenarioId: string): Promise<boolean> {
  const supabase = createClient();

  // Fetch the scenario to get property_id
  const { data: scenario } = await supabase
    .from('underwriting_scenarios')
    .select('*')
    .eq('id', scenarioId)
    .single();

  if (!scenario) return false;

  // Clear siblings' is_primary
  await supabase
    .from('underwriting_scenarios')
    .update({ is_primary: false })
    .eq('property_id', scenario.property_id);

  // Set this one as primary
  const { error } = await supabase
    .from('underwriting_scenarios')
    .update({ is_primary: true })
    .eq('id', scenarioId);

  if (error) {
    console.error('Error promoting scenario:', error.message);
    return false;
  }

  // Sync to properties table
  await syncPrimaryToProperty(
    scenario.property_id,
    scenario.inputs as PropertyInputs,
    scenario.results as UnderwritingResults,
  );

  return true;
}

// ── Properties Table Sync ─────────────────────────────────────

async function syncPrimaryToProperty(
  propertyId: string,
  inputs: PropertyInputs,
  results: UnderwritingResults,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('properties')
    .update({
      price: inputs.purchasePrice,
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
    })
    .eq('id', propertyId);

  if (error) {
    console.error('Error syncing primary to property:', error.message);
  }
}
