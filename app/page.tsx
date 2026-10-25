import { publicMetadata } from "@/lib/public-seo";

export const metadata = publicMetadata("/", "Classic & Collector Cars | Motorcar Society Registry", "Explore the Motorcar Society Private Registry for classic and collector cars. Discuss buying a supercar or selling your car privately with Barnaby.");

import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";
import MotorcarApp from "./motorcar-app";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getChatGPTUser();
  const signInPath = chatGPTSignInPath("/");
  const signOutPath = chatGPTSignOutPath("/");

  return <MotorcarApp signInPath={signInPath} signOutPath={signOutPath} userEmail={user?.email ?? null} />;
}
