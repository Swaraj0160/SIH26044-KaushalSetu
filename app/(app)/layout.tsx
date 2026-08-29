import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/kaushal/app-shell";
import { getPersona } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const persona = await getPersona();
  if (!persona) redirect("/login");
  return <AppShell persona={persona}>{children}</AppShell>;
}
