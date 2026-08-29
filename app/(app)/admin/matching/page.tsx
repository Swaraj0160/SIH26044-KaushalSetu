import {
  MatchWeightTuner,
  type TunerFactor,
} from "@/components/kaushal/weight-tuner";
import { PageHeader } from "@/components/kaushal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOpportunityMatchForStudent } from "@/lib/data";
import { MATCH_WEIGHTS } from "@/lib/engines/config";
import { requireRole } from "@/lib/guards";

export default async function MatchingConfig() {
  await requireRole("super_admin");
  const sample = getOpportunityMatchForStudent("stu-aarav", "opp-hero-ml")!;

  const factors: TunerFactor[] = sample.match.factors.map((f) => ({
    key: f.key,
    label: f.label,
    value: f.value,
    defaultWeight: MATCH_WEIGHTS[f.key],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matching configuration"
        description="The match score is a transparent weighted sum. Adjust the weights and watch a real sample recompute — the same arithmetic the engine runs."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            Live sample — Aarav Sharma × ML Engineer Intern (VedaLabs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MatchWeightTuner
            factors={factors}
            sampleLabel="Aarav Sharma → ML Engineer Intern, VedaLabs AI"
          />
        </CardContent>
      </Card>
      <div className="border-border bg-muted/40 text-muted-foreground rounded-lg border p-4 text-sm">
        Because the score is deterministic and attributable, a deployment can be
        audited: given a candidate&apos;s factor values and the configured
        weights, the score is reproducible to the point. No model, no opacity.
      </div>
    </div>
  );
}
