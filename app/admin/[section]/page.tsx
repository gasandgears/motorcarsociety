import { redirect } from "next/navigation";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../../chatgpt-auth";
import MotorcarApp from "../../motorcar-app";

export const dynamic = "force-dynamic";

const sections = ["dossier-requests", "vehicle-submissions", "contacts", "wanted-list", "registry-releases", "accounts"] as const;
type AdminSection = typeof sections[number];

export default async function AdminPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as AdminSection)) redirect("/admin/dossier-requests");
  const user = await getChatGPTUser();
  const returnPath = `/admin/${section}`;
  if (!user) redirect(chatGPTSignInPath(returnPath));
  return <MotorcarApp initialAdminSection={section as AdminSection} signInPath={chatGPTSignInPath(returnPath)} signOutPath={chatGPTSignOutPath("/")} userEmail={user.email} />;
}
