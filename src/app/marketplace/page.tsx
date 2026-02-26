import { Suspense } from "react";
import { createServerSupabaseClient } from "@/utils/supabase-server";
import MarketplaceClient from "./MarketplaceClient";
import styles from "./Marketplace.module.css";

export default async function MarketplacePage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("properties").select("*");
  const properties = data || [];

  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <p>Loading properties...</p>
        </div>
      }
    >
      <MarketplaceClient properties={properties} />
    </Suspense>
  );
}
