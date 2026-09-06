import { redirect } from "next/navigation";
import { AdminRecordDetail } from "@/components/admin-record-detail";
import { chatGPTSignInPath, getChatGPTUser } from "../../../chatgpt-auth";

export const dynamic = "force-dynamic";
const sections = ["dossier-requests", "vehicle-submissions", "contacts", "wanted-list", "registry-releases", "accounts"] as const;

export default async function AdminRecordPage({ params }: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params; if (!sections.includes(section as typeof sections[number])) redirect("/admin/dossier-requests");
  const user = await getChatGPTUser(); const returnPath = `/admin/${section}/${encodeURIComponent(id)}`; if (!user) redirect(chatGPTSignInPath(returnPath));
  return <AdminRecordDetail type={section} id={id} />;
}
