import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

type LifecycleState = "done" | "current" | "upcoming";
interface LifecycleStep {
  key: string;
  label: string;
  state: LifecycleState;
  detail?: string;
}

const LIFECYCLE_ORDER = [
  "discovered",
  "applied",
  "shortlisted",
  "selected",
  "onboarding",
  "active",
  "milestones",
  "mentor_feedback",
  "final_evaluation",
  "completed",
  "verified_skills",
] as const;

const LIFECYCLE_LABEL: Record<string, string> = {
  discovered: "Discovered",
  applied: "Applied",
  shortlisted: "Shortlisted",
  selected: "Selected",
  onboarding: "Onboarding",
  active: "Active",
  milestones: "Milestones",
  mentor_feedback: "Mentor feedback",
  final_evaluation: "Final evaluation",
  completed: "Completed",
  verified_skills: "Verified skills",
};

export default async function InternshipWorkspace() {
  const sid = await currentStudentId();
  const d = getDataset();
  const internships = d.internships.filter((i) => i.studentId === sid);

  if (!internships.length) {
    return (
      <div>
        <PageHeader title="Internship workspace" />
        <p className="text-muted-foreground text-sm">
          No internships yet. When you are selected, this workspace tracks the
          full lifecycle — discovered → applied → shortlisted → selected →
          onboarding → active → milestones → mentor feedback → final evaluation
          → completed — and, on completion, writes a verified skill delta to
          your Competency Passport.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internship workspace"
        description="The loop that matters: practical work → structured skill delta → verified competency → Competency Passport → higher institutional readiness."
      />

      {internships.map((it) => {
        const opp = d.opportunityById.get(it.opportunityId)!;
        const role = d.roleById.get(opp.roleId)!;
        const employer = d.employerById.get(it.employerId)!;
        const doneMilestones = it.milestones.filter((m) => m.done).length;
        const app = d.applications.find(
          (a) => a.studentId === sid && a.opportunityId === it.opportunityId,
        );
        const reachedShortlist =
          !!app &&
          ["shortlisted", "interview", "offer", "hired"].includes(app.status);
        const isCompleted = it.status === "completed";
        const started = isCompleted || it.status === "active";

        const stepState = (key: string): LifecycleState => {
          switch (key) {
            case "discovered":
              return "done";
            case "applied":
              return app ? "done" : "upcoming";
            case "shortlisted":
              return reachedShortlist ? "done" : app ? "current" : "upcoming";
            case "selected":
              return "done";
            case "onboarding":
              return started ? "done" : "current";
            case "active":
              return isCompleted ? "done" : started ? "current" : "upcoming";
            case "milestones":
              return doneMilestones === it.milestones.length &&
                it.milestones.length > 0
                ? "done"
                : doneMilestones > 0
                  ? "current"
                  : "upcoming";
            case "mentor_feedback":
              return it.weeklyLogs.length ? "done" : "upcoming";
            case "final_evaluation":
              return it.finalEvaluation ? "done" : "upcoming";
            case "completed":
              return isCompleted ? "done" : "upcoming";
            case "verified_skills":
              return it.finalEvaluation?.verifiedCompetencyIds.length
                ? "done"
                : "upcoming";
            default:
              return "upcoming";
          }
        };

        const steps: LifecycleStep[] = LIFECYCLE_ORDER.map((key) => ({
          key,
          label: LIFECYCLE_LABEL[key],
          state: stepState(key),
          detail:
            key === "milestones"
              ? `${doneMilestones}/${it.milestones.length}`
              : key === "mentor_feedback" && it.weeklyLogs.length
                ? `${it.weeklyLogs.length} logs`
                : key === "verified_skills" && it.finalEvaluation
                  ? `${it.finalEvaluation.verifiedCompetencyIds.length} competencies`
                  : undefined,
        }));

        return (
          <Card key={it.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>
                  {role.title} · {employer.name}
                </CardTitle>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {it.startDate} → {it.endDate} · mentor {it.mentorName} ·
                  faculty {it.facultyMentorName}
                </div>
              </div>
              <Badge
                variant={it.status === "completed" ? "success" : "info"}
                className="capitalize"
              >
                {it.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* lifecycle pipeline */}
              <div>
                <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  Lifecycle
                </div>
                <ol className="flex flex-wrap gap-x-1.5 gap-y-2">
                  {steps.map((step, i) => (
                    <li key={step.key} className="flex items-center gap-1.5">
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap",
                          step.state === "done"
                            ? "border-success/30 bg-success/10 text-success"
                            : step.state === "current"
                              ? "border-primary/40 bg-primary-muted text-primary font-medium"
                              : "border-border text-muted-foreground",
                        ].join(" ")}
                      >
                        <span aria-hidden>
                          {step.state === "done"
                            ? "✓"
                            : step.state === "current"
                              ? "●"
                              : "○"}
                        </span>
                        {step.label}
                        {step.detail ? (
                          <span className="opacity-70">· {step.detail}</span>
                        ) : null}
                      </span>
                      {i < steps.length - 1 ? (
                        <span
                          className="text-muted-foreground/50 text-xs"
                          aria-hidden
                        >
                          →
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                  <span>Milestones</span>
                  <span>
                    {doneMilestones}/{it.milestones.length}
                  </span>
                </div>
                <Progress
                  value={(doneMilestones / it.milestones.length) * 100}
                  className="h-1.5"
                />
                <ul className="mt-2 space-y-1 text-sm">
                  {it.milestones.map((m) => (
                    <li key={m.title} className="flex items-center gap-2">
                      <span
                        className={
                          m.done ? "text-success" : "text-muted-foreground"
                        }
                      >
                        {m.done ? "✓" : "○"}
                      </span>
                      {m.title}
                      <span className="text-muted-foreground text-xs">
                        · due {m.due}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                    Objectives
                  </div>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    {it.objectives.map((o) => (
                      <li key={o}>• {o}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                    Skill delta{" "}
                    {it.status === "completed" ? "(verified)" : "(in progress)"}
                  </div>
                  <ul className="space-y-1 text-sm">
                    {it.skillDelta.map((s) => (
                      <li
                        key={s.skillId}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {d.skillById.get(s.skillId)?.name ?? s.skillId}
                        </span>
                        <span className="tabular text-muted-foreground">
                          L{s.before} →{" "}
                          <span className="text-success">L{s.after}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Weekly logs
                </div>
                <div className="space-y-1.5">
                  {it.weeklyLogs.map((w) => (
                    <div key={w.week} className="flex gap-3 text-sm">
                      <span className="tabular text-muted-foreground">
                        W{w.week}
                      </span>
                      <span className="flex-1">{w.summary}</span>
                      <span className="tabular text-muted-foreground text-xs">
                        mentor {w.mentorRating}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {it.finalEvaluation ? (
                <div className="border-success/30 bg-success/8 rounded-lg border p-3 text-sm">
                  <div className="text-success font-medium">
                    Final evaluation: {it.finalEvaluation.score}/100 —{" "}
                    {it.finalEvaluation.verdict}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    Verified competencies written to Competency Passport:{" "}
                    {it.finalEvaluation.verifiedCompetencyIds
                      .map((c) => d.competencyById.get(c)?.name ?? c)
                      .join(", ")}
                  </div>
                </div>
              ) : (
                <div className="border-border bg-muted/40 text-muted-foreground rounded-lg border p-3 text-xs">
                  On completion, the mentor&apos;s evaluation converts this
                  skill delta into <strong>industry-verified</strong> evidence
                  and lifts the relevant competencies in the Passport.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
