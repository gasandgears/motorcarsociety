import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import MotorcarApp from "./motorcar-app";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getChatGPTUser();
  const signInPath = chatGPTSignInPath("/");

  return <MotorcarApp signInPath={signInPath} userEmail={user?.email ?? null} />;
}
