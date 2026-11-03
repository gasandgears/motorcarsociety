import { createUserClient } from "@/lib/supabase/server";
import { VisitorSignup } from "@/components/visitor-signup";
export async function VisitorSignupGate() {
  try {
    const client = await createUserClient();
    const { data, error } = await client.auth.getUser();
    // Fail closed: never mount the prompt for a known user or an unresolved auth error.
    if (data.user || (error && error.name !== "AuthSessionMissingError")) return null;
  } catch { return null; }
  return <VisitorSignup />;
}
