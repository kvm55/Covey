import { createServerSupabaseClient } from "@/utils/supabase-server";
import CoveySelectClient from "./CoveySelectClient";

export default async function CoveySelectPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("properties").select("*");
  const properties = data || [];

  return <CoveySelectClient properties={properties} />;
}
