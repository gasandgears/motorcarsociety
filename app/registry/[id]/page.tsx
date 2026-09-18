import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../../chatgpt-auth";
import MotorcarApp from "../../motorcar-app";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getChatGPTUser();
  const returnPath = `/registry/${id}`;
  if (!user) redirect(`${chatGPTSignInPath(returnPath)}${chatGPTSignInPath(returnPath).includes("?") ? "&" : "?"}mode=register`);
  return <MotorcarApp initialCarId={id} signInPath={chatGPTSignInPath(returnPath)} signOutPath={chatGPTSignOutPath(returnPath)} userEmail={user?.email ?? null} />;
}
