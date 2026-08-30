import Link from "next/link";

import { PageHeader } from "@/components/kaushal/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getInbox, type InboxItem } from "@/lib/data";
import { getStudentCtx } from "@/lib/data/viewer";
import { currentStudentId } from "@/lib/guards";

const TONE: Record<string, string> = {
  action: "border-l-primary",
  info: "border-l-info",
  positive: "border-l-success",
};

export default async function NotificationsPage() {
  const sid = await currentStudentId();
  const ctx = await getStudentCtx(sid);
  const { attention, recent } = getInbox(sid, ctx);

  return (
    <div className="space-y-6">
      <PageHeader
        title="What changed"
        description="Deterministic — generated from the state of your record. What needs your action, then what has happened. In-app only in the prototype; production adds email / push."
      />

      <section>
        <h2 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
          Needs your action ({attention.length})
        </h2>
        {attention.length ? (
          <div className="space-y-2">
            {attention.map((it, i) => (
              <Row key={i} it={it} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              Nothing needs your attention right now. Keep going on your Next
              Best Action.
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
          Recent activity
        </h2>
        <div className="space-y-1.5">
          {recent.map((it, i) => (
            <Link
              key={i}
              href={it.href}
              className="border-border hover:bg-muted/40 flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
            >
              <span>{it.title}</span>
              <span className="text-muted-foreground shrink-0 text-xs">
                {it.detail}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ it }: { it: InboxItem }) {
  return (
    <Link
      href={it.href}
      className={`border-border ${TONE[it.tone] ?? "border-l-border"} hover:bg-muted/40 block rounded-md border border-l-4 p-3`}
    >
      <div className="text-sm font-medium">{it.title}</div>
      <p className="text-muted-foreground mt-0.5 text-sm">{it.detail}</p>
    </Link>
  );
}
