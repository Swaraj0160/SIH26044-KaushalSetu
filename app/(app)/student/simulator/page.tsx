import { redirect } from "next/navigation";

// The Career Simulator now lives inside the single Career destination.
export default function LegacySimulatorPage() {
  redirect("/student/career?tab=explore");
}
