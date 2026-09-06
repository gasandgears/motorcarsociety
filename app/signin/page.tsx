import SignInForm from "./signin-form";
import { safeReturnPath } from "@/lib/safe-return-path";
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ return_to?: string; mode?: string }> }) { const params = await searchParams; return <SignInForm returnTo={safeReturnPath(params.return_to)} initialMode={params.mode === "register" ? "register" : "signin"} />; }
