import { setOverrideAction } from "@/app/actions";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { getOverrides } from "@/lib/overrides";

function DecisionButton({
  projectKey,
  value,
  label,
  tone,
}: {
  projectKey: string;
  value: string;
  label: string;
  tone: "approve" | "changes";
}) {
  return (
    <form action={setOverrideAction}>
      <input type="hidden" name="key" value={projectKey} />
      <input type="hidden" name="value" value={value} />
      <input type="hidden" name="revalidate" value="/faculty" />
      <button
        className={
          tone === "approve"
            ? "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1 text-xs font-medium"
            : "border-border text-muted-foreground hover:bg-muted rounded-md border px-3 py-1 text-xs font-medium"
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function VerificationQueue() {
  const persona = await requireRole("faculty");
  const d = getDataset();
  const faculty = d.facultyById.get(persona.refId)!;
  const overrides = await getOverrides();

  const projects = d.projects.filter(
    (p) =>
      d.studentById.get(p.studentId)?.institutionId === faculty.institutionId,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence verification"
        description="Faculty verification converts self-declared or project evidence into a stronger evidence type, raising the skill's confidence and every dependent match. This is the human-in-the-loop that makes the profile trustworthy."
      />
      <Card>
        <CardContent className="space-y-2 pt-5">
          {projects.map((p) => {
            const key = `verify:project:${p.id}`;
            const decision = overrides[key];
            const preVerified = Boolean(p.facultyVerifiedBy);
            const approved = preVerified || decision === "approved";
            const changesRequested = decision === "changes_requested";

            return (
              <div key={p.id} className="border-border rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {d.studentById.get(p.studentId)!.name} ·{" "}
                      {d.studentById.get(p.studentId)!.programme} · skills:{" "}
                      {p.skillIds
                        .map((s) => d.skillById.get(s)?.name)
                        .join(", ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {approved ? (
                      <Badge variant="success">
                        approved
                        {p.facultyVerifiedBy
                          ? ` · ${p.facultyVerifiedBy}`
                          : " · you"}
                      </Badge>
                    ) : changesRequested ? (
                      <>
                        <Badge variant="warning">changes requested</Badge>
                        <DecisionButton
                          projectKey={key}
                          value="approved"
                          label="Approve now"
                          tone="approve"
                        />
                      </>
                    ) : (
                      <>
                        <DecisionButton
                          projectKey={key}
                          value="approved"
                          label="Approve"
                          tone="approve"
                        />
                        <DecisionButton
                          projectKey={key}
                          value="changes_requested"
                          label="Request changes"
                          tone="changes"
                        />
                      </>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {p.summary}
                </p>
                {changesRequested ? (
                  <p className="text-warning mt-2 text-xs">
                    Sent back to the student — evidence stays at its current
                    (unverified) confidence until they resubmit.
                  </p>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
