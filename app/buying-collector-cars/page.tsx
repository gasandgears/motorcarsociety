import { publicMetadata } from "@/lib/public-seo";
import Link from "next/link";
import { PublicHero, PublicPageShell, ProseSection } from "@/components/public-page-shell";

export const metadata = publicMetadata("/buying-collector-cars", "Buying Classic & Collector Cars | Motorcar Society", "Searching for a classic car, collector car or supercar? Learn about private introductions, vehicle provenance and contacting Barnaby at Motorcar Society.");

export default function BuyingPage() {
  return <PublicPageShell><main>
    <PublicHero eyebrow="Buying a collector car" title="A private approach to finding your next car." intro="Whether you are searching for classic cars for sale, a significant collector car or a high-end supercar, begin with the car’s history and a direct conversation." />
    <ProseSection>
      <h2>Start with your collection goals</h2>
      <p>Tell Barnaby the make, model, era and qualities you are seeking. Motorcar Society supports personal introductions and private acquisition conversations. Members can record the individual cars they are seeking in a private Wanted List.</p>
      <h2>Explore the Registry and confirm availability</h2>
      <p><Link href="/#registry-list">Browse the Registry previews</Link> to see the cars currently presented. A Registry entry is a record of a car and its story, and does not by itself confirm that the car is for sale. Ask Barnaby about its current status and the appropriate next step. Additional vehicle information and dossier requests require the relevant member access.</p>
      <h2>Understand the car before proceeding</h2>
      <p>Ownership, restoration, service and condition records help explain a collector car’s history. Ask which records are available and discuss any questions that need further review. Supporting material is shared through an approved process, with respect for owner privacy.</p>
      <h2>Considering selling instead?</h2>
      <p>If you are looking for an alternative to selling at a classic-car auction, <Link href="/submit-a-car">submit your car privately for review</Link>. Barnaby starts with its identity, location and story. Submission does not create a public listing; any release follows approval of the presentation and audience.</p>
      <h2>Speak with Barnaby Brokaw</h2>
      <p>For Registry questions and private introductions, call or text <a href="tel:+16195182469">619-518-2469</a> or email <a href="mailto:bbforcars@gmail.com">bbforcars@gmail.com</a>. You can also visit the <Link href="/contact">contact page</Link> or <Link href="/about">learn about membership</Link>.</p>
    </ProseSection>
  </main></PublicPageShell>;
}
