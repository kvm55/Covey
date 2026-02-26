// ============================================================
// Covey Debt Fund — One-Click Scenario Creator
// Qualifies a deal for Covey financing and creates a comparison scenario
// ============================================================

import type { PropertyInputs, UnderwritingResults } from '@/utils/underwriting';
import { runUnderwriting } from '@/utils/underwriting';
import { qualifyForCoveyDebt, applyCoveyDebtTerms } from '@/data/covey-debt';
import { createScenario, toStrategyType } from '@/utils/scenarios';

interface CoveyDebtScenarioResult {
  success: boolean;
  scenarioId?: string;
  reason?: string;
}

export async function createCoveyDebtScenario(
  propertyId: string,
  currentInputs: PropertyInputs,
  currentResults: UnderwritingResults,
  scenarioCount: number,
): Promise<CoveyDebtScenarioResult> {
  // Qualify the deal
  const qualification = qualifyForCoveyDebt(currentInputs, currentResults.noi);

  if (!qualification.eligible) {
    return {
      success: false,
      reason: qualification.reason || 'Deal does not qualify for Covey Debt Fund',
    };
  }

  // Apply Covey terms to create new inputs
  const coveyInputs = applyCoveyDebtTerms(currentInputs, qualification);

  // Run underwriting with Covey terms
  const coveyResults = runUnderwriting(coveyInputs);

  // Create the scenario
  const scenario = await createScenario({
    propertyId,
    name: `Covey Debt Fund — Scenario ${scenarioCount + 1}`,
    strategyType: toStrategyType(currentInputs.type),
    inputs: coveyInputs,
    results: coveyResults,
    isPrimary: false,
  });

  if (!scenario) {
    return { success: false, reason: 'Failed to save scenario' };
  }

  return { success: true, scenarioId: scenario.id };
}
