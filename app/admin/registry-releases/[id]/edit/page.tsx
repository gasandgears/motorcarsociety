import { redirect } from "next/navigation";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../../../../chatgpt-auth";
import MotorcarApp from "../../../../motorcar-app";

export const dynamic = "force-dynamic";

export default async function EditRegistryCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getChatGPTUser();
  const returnPath = `/admin/registry-releases/${encodeURIComponent(id)}/edit`;
  if (!user) redirect(chatGPTSignInPath(returnPath));

  return (
    <MotorcarApp
      initialAdminSection="registry-releases"
      initialEditCarId={id}
      signInPath={chatGPTSignInPath(returnPath)}
      signOutPath={chatGPTSignOutPath("/")}
      userEmail={user.email}
    />
  );
}
