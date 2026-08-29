/**
 * Small but real adaptive-assessment bank. Each skill has questions across three
 * difficulty tiers plus scenario / confidence items. Scoring and adaptivity are
 * deterministic (see components/kaushal/assessment.tsx).
 *
 * Content is illustrative and written for the demo — not a certification bank.
 */

import type { Id } from "@/lib/domain/types";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  skillId: Id;
  difficulty: Difficulty;
  kind: "mcq" | "scenario";
  topic: string;
  prompt: string;
  options: string[];
  answer: number;
  rationale: string;
}

export interface ConfidenceQuestion {
  id: string;
  prompt: string;
}

export const confidenceItems: ConfidenceQuestion[] = [
  {
    id: "conf-1",
    prompt:
      "How confident are you applying this skill unsupervised on real work?",
  },
];

const Q = (
  id: string,
  skillId: Id,
  difficulty: Difficulty,
  topic: string,
  prompt: string,
  options: string[],
  answer: number,
  rationale: string,
  kind: Question["kind"] = "mcq",
): Question => ({
  id,
  skillId,
  difficulty,
  kind,
  topic,
  prompt,
  options,
  answer,
  rationale,
});

export const questionBank: Question[] = [
  // ── SQL ──────────────────────────────────────────────────────────────
  Q(
    "sql-e1",
    "sk-sql",
    "easy",
    "SELECT basics",
    "Which clause filters rows before grouping?",
    ["WHERE", "HAVING", "ORDER BY", "LIMIT"],
    0,
    "WHERE filters rows; HAVING filters groups after aggregation.",
  ),
  Q(
    "sql-e2",
    "sk-sql",
    "easy",
    "Joins",
    "An INNER JOIN returns…",
    [
      "All rows from the left table",
      "Only rows with a match in both tables",
      "All rows from both tables",
      "Rows with no match",
    ],
    1,
    "INNER JOIN keeps only matched rows.",
  ),
  Q(
    "sql-m1",
    "sk-sql",
    "medium",
    "Aggregation",
    "To count distinct customers per city you would use…",
    [
      "COUNT(*) GROUP BY city",
      "COUNT(DISTINCT customer_id) GROUP BY city",
      "DISTINCT COUNT(city)",
      "SUM(customer_id) GROUP BY city",
    ],
    1,
    "COUNT(DISTINCT …) with GROUP BY city.",
  ),
  Q(
    "sql-m2",
    "sk-sql",
    "medium",
    "NULLs",
    "`WHERE col <> 'x'` will NOT return rows where col is…",
    ["'y'", "'' (empty string)", "NULL", "'X'"],
    2,
    "Comparisons with NULL are unknown, so NULL rows are excluded.",
  ),
  Q(
    "sql-h1",
    "sk-sql",
    "hard",
    "Window functions",
    "To rank rows within each group by amount, use…",
    [
      "RANK() OVER (PARTITION BY grp ORDER BY amount DESC)",
      "GROUP BY grp ORDER BY amount",
      "RANK() GROUP BY grp",
      "ORDER BY amount OVER grp",
    ],
    0,
    "PARTITION BY defines the group; ORDER BY defines the ranking.",
  ),
  Q(
    "sql-h2",
    "sk-sql",
    "hard",
    "Performance",
    "A query filtering on an unindexed high-cardinality column is slow. Best first step?",
    [
      "Add DISTINCT",
      "Add an index on that column",
      "Rewrite as a subquery",
      "Increase LIMIT",
    ],
    1,
    "Index the filter column to avoid a full scan.",
  ),

  // ── Applied Statistics ───────────────────────────────────────────────
  Q(
    "stats-e1",
    "sk-stats",
    "easy",
    "Distributions",
    "The mean is more affected than the median by…",
    ["Sample size", "Outliers", "Units", "The mode"],
    1,
    "The mean is sensitive to outliers; the median is robust.",
  ),
  Q(
    "stats-m1",
    "sk-stats",
    "medium",
    "Hypothesis testing",
    "A p-value of 0.03 at α = 0.05 means…",
    [
      "Accept the null",
      "Reject the null",
      "The effect is large",
      "The sample is biased",
    ],
    1,
    "p < α → reject the null (it says nothing about effect size).",
  ),
  Q(
    "stats-m2",
    "sk-stats",
    "medium",
    "Sampling",
    "Increasing sample size primarily reduces…",
    ["Bias", "Standard error", "The true effect", "The significance level"],
    1,
    "SE shrinks with √n; bias is not fixed by size.",
  ),
  Q(
    "stats-h1",
    "sk-stats",
    "hard",
    "Multiple testing",
    "Running 20 independent tests at α = 0.05, expected false positives ≈",
    ["0", "1", "5", "20"],
    1,
    "20 × 0.05 = 1 expected false positive; correct for multiplicity.",
  ),
  Q(
    "stats-h2",
    "sk-stats",
    "hard",
    "Regression",
    "Multicollinearity between predictors mainly inflates…",
    [
      "R²",
      "Coefficient standard errors",
      "The residual mean",
      "The sample size",
    ],
    1,
    "It makes coefficient estimates unstable (large SEs).",
  ),

  // ── Machine Learning ─────────────────────────────────────────────────
  Q(
    "ml-e1",
    "sk-ml",
    "easy",
    "Basics",
    "Classifying emails as spam / not-spam is…",
    [
      "Unsupervised learning",
      "Supervised classification",
      "Reinforcement learning",
      "Clustering",
    ],
    1,
    "Labelled target + discrete classes → supervised classification.",
  ),
  Q(
    "ml-m1",
    "sk-ml",
    "medium",
    "Evaluation",
    "For a highly imbalanced dataset, the most misleading single metric is…",
    ["Precision", "Recall", "Accuracy", "F1"],
    2,
    "Accuracy is dominated by the majority class.",
  ),
  Q(
    "ml-m2",
    "sk-ml",
    "medium",
    "Overfitting",
    "Train accuracy 0.99, validation 0.71. Best response?",
    [
      "Train longer",
      "Add regularisation / more data",
      "Increase model size",
      "Remove the validation set",
    ],
    1,
    "The gap indicates overfitting; regularise or get more data.",
  ),
  Q(
    "ml-h1",
    "sk-ml",
    "hard",
    "Leakage",
    "Scaling features using statistics from the full dataset before splitting causes…",
    ["Underfitting", "Data leakage", "Class imbalance", "Vanishing gradients"],
    1,
    "Test information leaks into training via the scaler.",
  ),
  Q(
    "ml-h2",
    "sk-ml",
    "hard",
    "Model selection",
    "Nested cross-validation is used to…",
    [
      "Speed up training",
      "Get an unbiased estimate of tuned-model performance",
      "Reduce dataset size",
      "Replace the test set entirely",
    ],
    1,
    "Outer loop estimates generalisation of the whole tuning procedure.",
  ),
  Q(
    "ml-s1",
    "sk-ml",
    "medium",
    "Scenario",
    "Your churn model has recall 0.9 but precision 0.3 and the retention team can only call 100 customers/week. What do you change?",
    [
      "Nothing — recall is high",
      "Raise the decision threshold to improve precision",
      "Switch to accuracy",
      "Collect fewer features",
    ],
    1,
    "With a capacity constraint, precision at the top of the ranked list matters most.",
    "scenario",
  ),

  // ── MLOps & Model Deployment ────────────────────────────────────────
  Q(
    "mlops-e1",
    "sk-mlops",
    "easy",
    "Serving",
    "Wrapping a model behind an HTTP endpoint is called…",
    [
      "Batch scoring",
      "Model serving",
      "Feature engineering",
      "Hyperparameter tuning",
    ],
    1,
    "Serving = exposing the model for inference requests.",
  ),
  Q(
    "mlops-m1",
    "sk-mlops",
    "medium",
    "Monitoring",
    "Input feature distributions shift after deployment. This is…",
    ["Concept drift", "Data (covariate) drift", "Label leakage", "Overfitting"],
    1,
    "Covariate/data drift = the input distribution changes.",
  ),
  Q(
    "mlops-m2",
    "sk-mlops",
    "medium",
    "Reproducibility",
    "The single most important thing to version alongside code for a model?",
    [
      "The IDE",
      "Data + model artefacts + config",
      "The OS theme",
      "The README",
    ],
    1,
    "Reproducibility needs data, artefacts and config pinned together.",
  ),
  Q(
    "mlops-h1",
    "sk-mlops",
    "hard",
    "Rollout",
    "Safest way to release a new model version to production traffic?",
    [
      "Replace 100% immediately",
      "Canary / shadow a small % and compare metrics",
      "Only test locally",
      "Skip monitoring for speed",
    ],
    1,
    "Canary/shadow limits blast radius and enables comparison.",
  ),
  Q(
    "mlops-s1",
    "sk-mlops",
    "hard",
    "Scenario",
    "Latency SLO is 200ms; your model takes 450ms. Options that keep quality acceptable?",
    [
      "Do nothing",
      "Quantise / distil the model, or add a cache for frequent inputs",
      "Remove the SLO",
      "Return random predictions",
    ],
    1,
    "Model compression and caching reduce latency without abandoning quality.",
    "scenario",
  ),

  // ── GMP & Quality Systems ──────────────────────────────────────────
  Q(
    "gmp-e1",
    "sk-gmp",
    "easy",
    "Documentation",
    "In GMP, 'if it isn't documented…'",
    ["it's faster", "it didn't happen", "it's optional", "it's confidential"],
    1,
    "The core GMP principle: undocumented work is not evidenced.",
  ),
  Q(
    "gmp-m1",
    "sk-gmp",
    "medium",
    "Deviations",
    "An out-of-specification result during batch testing must first trigger…",
    [
      "Immediate rejection",
      "A documented investigation (OOS/deviation)",
      "Re-labelling",
      "Nothing if small",
    ],
    1,
    "OOS results require a formal, documented investigation before disposition.",
  ),
  Q(
    "gmp-m2",
    "sk-gmp",
    "medium",
    "AYUSH context",
    "Schedule T of the Drugs & Cosmetics Act covers…",
    [
      "Import tariffs",
      "GMP requirements for ASU drug manufacturing",
      "Advertising standards",
      "Clinical trials",
    ],
    1,
    "Schedule T = GMP for Ayurvedic, Siddha and Unani medicines.",
  ),
  Q(
    "gmp-h1",
    "sk-gmp",
    "hard",
    "CAPA",
    "The difference between corrective and preventive action is…",
    [
      "None",
      "Corrective fixes the occurred issue; preventive stops recurrence / potential issues",
      "Preventive is cheaper",
      "Corrective is optional",
    ],
    1,
    "CAPA: correct what happened + prevent it (and similar) from recurring.",
  ),
  Q(
    "gmp-h2",
    "sk-gmp",
    "hard",
    "Raw materials",
    "Before a herbal raw material enters production it must be…",
    [
      "Used immediately",
      "Quarantined and released only after identity/quality checks",
      "Stored with finished goods",
      "Labelled after use",
    ],
    1,
    "Incoming materials are quarantined pending QC release.",
  ),
];

export function bankForSkill(skillId: Id): Question[] {
  return questionBank.filter((q) => q.skillId === skillId);
}

export const assessableSkillIds = [
  ...new Set(questionBank.map((q) => q.skillId)),
];
