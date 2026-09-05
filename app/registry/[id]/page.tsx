import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../../chatgpt-auth";
import MotorcarApp from "../../motorcar-app";

export const dynamic = "force-dynamic";

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getChatGPTUser();
  const returnPath = `/registry/${id}`;
  return <MotorcarApp initialCarId={id} signInPath={chatGPTSignInPath(returnPath)} signOutPath={chatGPTSignOutPath(returnPath)} userEmail={user?.email ?? null} />;
}
