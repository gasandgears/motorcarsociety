import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";
import MotorcarApp from "./motorcar-app";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getChatGPTUser();
  const signInPath = chatGPTSignInPath("/");
  const signOutPath = chatGPTSignOutPath("/");

  return <MotorcarApp signInPath={signInPath} signOutPath={signOutPath} userEmail={user?.email ?? null} />;
}
