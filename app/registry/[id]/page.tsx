import type { Metadata } from "next";
import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { cars, carFiles } from "@/db/schema";
import { canPreviewRegistryCar, registryTeaser } from "@/lib/registry-access";
import { PublicPageShell, PublicHero, ProseSection } from "@/components/public-page-shell";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../../chatgpt-auth";
import MotorcarApp from "../../motorcar-app";

export const dynamic = "force-dynamic";

const getTeaser = cache(async (id: string) => {
  const [car] = await getDb().select({ id: cars.id, year: cars.year, make: cars.make, model: cars.model, category: cars.category, status: cars.status, visibility: cars.visibility }).from(cars).where(eq(cars.id, id)).limit(1);
  if (!car || !canPreviewRegistryCar(car)) return null;
  const [hero] = await getDb().select({ id: carFiles.id }).from(carFiles).where(and(eq(carFiles.carId, id), eq(carFiles.category, "hero"))).limit(1);
  return registryTeaser(car, hero ? `/api/registry/${id}/photos/${hero.id}` : undefined);
});

type PageProps = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const teaser = await getTeaser((await params).id);
  if (!teaser) return { title: "Vehicle", robots: { index: false, follow: false } };
  return { title: `${teaser.year} ${teaser.make} ${teaser.model}`, description: "Explore this Motorcar Society vehicle preview. Sign in, join, or contact Barnaby for further information and current availability.", alternates: { canonical: `/registry/${teaser.id}` } };
}

export default async function VehiclePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getChatGPTUser();
  const returnPath = `/registry/${id}`;
  if (user) return <MotorcarApp initialCarId={id} signInPath={chatGPTSignInPath(returnPath)} signOutPath={chatGPTSignOutPath(returnPath)} userEmail={user.email ?? null} />;
  const teaser = await getTeaser(id);
  if (!teaser) notFound();
  const signIn = chatGPTSignInPath(returnPath);
  return <PublicPageShell><main>
    <PublicHero eyebrow={teaser.category || "Registry preview"} title={`${teaser.year} ${teaser.make} ${teaser.model}`} intro="A preview from the Motorcar Society Registry. Contact Barnaby to confirm current availability." />
    <ProseSection>
      {teaser.heroImageUrl && <img src={teaser.heroImageUrl} alt={`${teaser.year} ${teaser.make} ${teaser.model}`} className="w-full rounded-xl" />}
      <h2>Discover more about this car</h2>
      <p><a href={signIn}>Log in</a> or <a href={`${signIn}${signIn.includes("?") ? "&" : "?"}mode=register`}>become a member</a> to view the full listing after membership approval.</p>
      <p><a href="/contact">Contact Barnaby</a> for more information, current availability, and private introductions.</p>
    </ProseSection>
  </main></PublicPageShell>;
}
