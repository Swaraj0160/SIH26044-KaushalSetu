import { setOverrideAction } from "@/app/actions";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { getOverrides } from "@/lib/overrides";

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
            const student = d.studentById.get(p.studentId)!;
            const verified =
              p.facultyVerifiedBy ||
              overrides[`verify:project:${p.id}`] === "done";
            return (
              <div key={p.id} className="border-border rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {student.name} · {student.programme} · skills:{" "}
                      {p.skillIds
                        .map((s) => d.skillById.get(s)?.name)
                        .join(", ")}
                    </div>
                  </div>
                  {verified ? (
                    <Badge variant="success">
                      verified
                      {p.facultyVerifiedBy
                        ? ` · ${p.facultyVerifiedBy}`
                        : " · you"}
                    </Badge>
                  ) : (
                    <form action={setOverrideAction}>
                      <input
                        type="hidden"
                        name="key"
                        value={`verify:project:${p.id}`}
                      />
                      <input type="hidden" name="value" value="done" />
                      <input type="hidden" name="revalidate" value="/faculty" />
                      <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1 text-xs font-medium">
                        Verify
                      </button>
                    </form>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {p.summary}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
