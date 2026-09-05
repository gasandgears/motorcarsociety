import SignInForm from "./signin-form";
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ return_to?: string; mode?: string }> }) { const params = await searchParams; return <SignInForm returnTo={params.return_to?.startsWith("/") ? params.return_to : "/"} initialMode={params.mode === "register" ? "register" : "signin"} />; }
