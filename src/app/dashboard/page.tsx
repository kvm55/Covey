import { createServerSupabaseClient } from "@/utils/supabase-server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("properties").select("*");
  const properties = data || [];

  return <DashboardClient properties={properties} />;
}
