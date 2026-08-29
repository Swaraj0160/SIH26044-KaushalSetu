import { redirect } from "next/navigation";

// The opportunities list now lives inside the single Career destination.
// Individual opportunity detail pages remain at /student/opportunities/[id].
export default function LegacyOpportunitiesPage() {
  redirect("/student/career?tab=opportunities");
}
