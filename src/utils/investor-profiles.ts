import { createClient } from '@/utils/supabase';
import type {
  InvestorBreed,
  BreedScores,
  FundAllocation,
  SliderValues,
  InvestorProfileRow,
} from '@/types/investor';

// ── Create ────────────────────────────────────────────────────

interface CreateInvestorProfileParams {
  breed: InvestorBreed;
  scores: BreedScores;
  responses: { ab: Record<string, 'A' | 'B'>; sliders: SliderValues };
  fundAllocation: FundAllocation[];
  userId?: string;
}

export async function createInvestorProfile(
  params: CreateInvestorProfileParams,
): Promise<InvestorProfileRow | null> {
  const supabase = createClient();
  const { breed, scores, responses, fundAllocation, userId } = params;

  const { data, error } = await supabase
    .from('investor_profiles')
    .insert({
      user_id: userId ?? null,
      breed,
      scores: scores as unknown as Record<string, unknown>,
      responses: responses as unknown as Record<string, unknown>,
      fund_allocation: fundAllocation as unknown as Record<string, unknown>[],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating investor profile:', error.message);
    return null;
  }
  return data as InvestorProfileRow;
}

// ── Read ──────────────────────────────────────────────────────

export async function fetchInvestorProfile(
  userId: string,
): Promise<InvestorProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('investor_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as InvestorProfileRow;
}

export async function fetchInvestorProfileById(
  profileId: string,
): Promise<InvestorProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('investor_profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) return null;
  return data as InvestorProfileRow;
}

// ── Update ────────────────────────────────────────────────────

export async function updateInvestorProfile(
  profileId: string,
  updates: Partial<Pick<InvestorProfileRow, 'breed' | 'scores' | 'responses' | 'fund_allocation'>>,
): Promise<InvestorProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('investor_profiles')
    .update(updates as Record<string, unknown>)
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating investor profile:', error.message);
    return null;
  }
  return data as InvestorProfileRow;
}

// ── Claim (link anonymous profile to authenticated user) ──────

export async function claimInvestorProfile(
  profileId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('investor_profiles')
    .update({ user_id: userId })
    .eq('id', profileId)
    .is('user_id', null);

  if (error) {
    console.error('Error claiming investor profile:', error.message);
    return false;
  }
  return true;
}
