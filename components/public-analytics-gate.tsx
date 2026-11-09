import { createUserClient } from "@/lib/supabase/server";
import { PublicAnalytics } from "@/components/public-analytics";

// The home page also hosts staff/member views without changing its URL.
// Fail closed and never load analytics for authenticated or unresolved sessions.
export async function PublicAnalyticsGate() {
  try {
    const client = await createUserClient();
    const { data, error } = await client.auth.getUser();
    if (data.user || (error && error.name !== "AuthSessionMissingError")) return null;
  } catch { return null; }
  return <PublicAnalytics />;
}
