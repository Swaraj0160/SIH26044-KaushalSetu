"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

export interface NavGroup {
  /** null label => flat items rendered without a group header */
  label: string | null;
  items: NavItem[];
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  const nested = href.split("/").length > 2;
  return nested && pathname.startsWith(href + "/");
}

export function GroupedNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4">
      {groups.map((g, gi) => {
        const groupActive = g.items.some((it) => isActive(pathname, it.href));
        return (
          <div key={g.label ?? `flat-${gi}`}>
            {g.label ? (
              <div
                className={cn(
                  "mb-1 px-2.5 text-[0.68rem] font-semibold tracking-wider uppercase",
                  groupActive ? "text-primary" : "text-muted-foreground/70",
                )}
              >
                {g.label}
              </div>
            ) : null}
            <div className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const active = isActive(pathname, it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-primary-muted text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {it.icon ? (
                      <span
                        aria-hidden
                        className="w-4 text-center text-[0.9rem]"
                      >
                        {it.icon}
                      </span>
                    ) : null}
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/** legacy flat nav kept for callers not yet migrated */
export function SideNav({ items }: { items: NavItem[] }) {
  return <GroupedNav groups={[{ label: null, items }]} />;
}
