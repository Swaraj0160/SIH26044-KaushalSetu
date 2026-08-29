import { PageHeader } from "@/components/kaushal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";

export default async function TaxonomyPage() {
  await requireRole("super_admin");
  const d = getDataset();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill & Role Taxonomy"
        description="NSQF-style proficiency, NOS/QP-shaped role profiles. Aligned to recognised frameworks rather than invented — see the technical showcase."
      />

      <Card>
        <CardHeader>
          <CardTitle>Roles ({d.roles.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {d.roles.map((r) => (
            <details key={r.id} className="border-border rounded-lg border p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm [&::-webkit-details-marker]:hidden">
                <span className="font-medium">{r.title}</span>
                <span className="text-muted-foreground text-xs">
                  {r.family} · NSQF ~{r.nsqfBand} · {r.requirements.length}{" "}
                  competencies
                </span>
              </summary>
              <div className="text-muted-foreground mt-2 space-y-1.5 text-sm">
                <p>{r.summary}</p>
                <div>
                  <span className="text-foreground font-medium">
                    Mandatory competencies:{" "}
                  </span>
                  {r.requirements
                    .filter((x) => x.mandatory)
                    .map(
                      (x) =>
                        `${d.competencyById.get(x.competencyId)?.name} ≥ L${x.minLevel}`,
                    )
                    .join(" · ")}
                </div>
                <div>
                  <span className="text-foreground font-medium">
                    Mandatory skills:{" "}
                  </span>
                  {r.mandatorySkillIds
                    .map((s) => d.skillById.get(s)?.name)
                    .join(", ")}
                </div>
                <div>
                  <span className="text-foreground font-medium">
                    Min. education:{" "}
                  </span>
                  {r.minEducation}
                </div>
              </div>
            </details>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competencies ({d.competencies.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="py-2 pr-3 font-medium">Competency</th>
                <th className="py-2 pr-3 font-medium">NSQF band</th>
                <th className="py-2 font-medium">Constituent skills</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {d.competencies.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-3 font-medium">
                    {c.name}{" "}
                    {c.behavioural ? (
                      <span className="text-muted-foreground text-xs">
                        (behavioural)
                      </span>
                    ) : null}
                  </td>
                  <td className="tabular py-2 pr-3">~{c.nsqfBand}</td>
                  <td className="text-muted-foreground py-2">
                    {c.skillIds.map((s) => d.skillById.get(s)?.name).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills ({d.skills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {d.skills.map((s) => (
              <span
                key={s.id}
                title={`${s.description}${s.nosCode ? ` · ${s.nosCode}` : ""}`}
                className="border-border bg-muted/40 rounded border px-1.5 py-0.5 text-xs"
              >
                {s.name}
                {s.nosCode ? (
                  <span className="text-muted-foreground ml-1">·NOS</span>
                ) : null}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
