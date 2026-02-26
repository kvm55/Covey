import { createServerSupabaseClient } from "@/utils/supabase-server";
import type { UnderwritingScenarioRow } from "@/types/underwriting";
import PropertyDetailClient from "./PropertyDetailClient";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch scenarios
  const { data: scenarioData } = await supabase
    .from("underwriting_scenarios")
    .select("*")
    .eq("property_id", id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  const scenarios = (scenarioData ?? []) as UnderwritingScenarioRow[];

  // If no scenarios, fetch bare property as fallback
  let property = null;
  if (scenarios.length === 0) {
    const { data: propertyData } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();
    property = propertyData;
  }

  return (
    <PropertyDetailClient
      propertyId={id}
      initialScenarios={scenarios}
      initialProperty={property}
    />
  );
}
