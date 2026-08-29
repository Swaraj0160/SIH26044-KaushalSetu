import { redirect } from "next/navigation";

// Skill gaps now live inside the single Career destination.
export default function LegacyGapsPage() {
  redirect("/student/career?tab=gaps");
}
