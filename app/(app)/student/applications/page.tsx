import { redirect } from "next/navigation";

// Applications now live inside the single Career destination.
export default function LegacyApplicationsPage() {
  redirect("/student/career?tab=applications");
}
