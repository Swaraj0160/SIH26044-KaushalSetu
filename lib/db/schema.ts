/**
 * Production database schema (Drizzle / PostgreSQL).
 *
 * This is the target relational model for a real deployment. The demo build does
 * NOT use it — it runs on the in-memory synthetic dataset in `lib/demo/` — but
 * `lib/data` is written so its functions can be reimplemented against these
 * tables without changing the UI or the engines.
 *
 * Multi-tenancy: every tenant-scoped table carries `institution_id`; production
 * enforces Row-Level Security on it (`institution_id = auth.jwt() ->> 'inst'`).
 */

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ── enums ──────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("app_role", [
  "student",
  "faculty",
  "recruiter",
  "institution_admin",
  "super_admin",
]);
export const institutionTypeEnum = pgEnum("institution_type", [
  "ayush",
  "engineering",
  "university",
  "polytechnic",
]);
export const evidenceKindEnum = pgEnum("evidence_kind", [
  "self_declared",
  "assessment",
  "project",
  "certificate",
  "faculty_verified",
  "industry_verified",
]);
export const opportunityTypeEnum = pgEnum("opportunity_type", [
  "internship",
  "job",
  "apprenticeship",
  "live_project",
  "mentorship",
]);
export const workModeEnum = pgEnum("work_mode", ["onsite", "hybrid", "remote"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
  "hired",
]);
export const internshipStatusEnum = pgEnum("internship_status", [
  "active",
  "completed",
  "terminated",
]);
export const collaborationTypeEnum = pgEnum("collaboration_type", [
  "guest_lecture",
  "workshop",
  "live_project",
  "research",
  "faculty_training",
  "consultancy",
  "curriculum_review",
]);
export const collaborationStageEnum = pgEnum("collaboration_stage", [
  "requested",
  "approved",
  "active",
  "completed",
]);
export const credentialKindEnum = pgEnum("credential_kind", [
  "competency_passport",
  "internship_certificate",
  "assessment_badge",
]);

const id = () => uuid("id").defaultRandom().primaryKey();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
/** NSQF-style 1..8 proficiency. */
const level = (name: string) => smallint(name);

// ── identity & orgs ────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: id(),
    // mirrors auth.users.id in Supabase
    authId: uuid("auth_id").notNull().unique(),
    email: text("email").notNull().unique(),
    role: roleEnum("role").notNull().default("student"),
    fullName: text("full_name").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("users_role_idx").on(t.role)],
);

export const institutions = pgTable("institutions", {
  id: id(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  type: institutionTypeEnum("type").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  established: smallint("established"),
  createdAt: createdAt(),
});

export const departments = pgTable(
  "departments",
  {
    id: id(),
    institutionId: uuid("institution_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    code: text("code").notNull(),
  },
  (t) => [index("departments_inst_idx").on(t.institutionId)],
);

export const employers = pgTable(
  "employers",
  {
    id: id(),
    name: text("name").notNull(),
    sector: text("sector").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    about: text("about").notNull().default(""),
    verified: boolean("verified").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("employers_verified_idx").on(t.verified)],
);

// ── taxonomy ───────────────────────────────────────────────────────────────

export const skillCategories = pgTable("skill_categories", {
  id: id(),
  name: text("name").notNull(),
  cluster: text("cluster").notNull(),
});

export const skills = pgTable(
  "skills",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => skillCategories.id),
    nosCode: text("nos_code"),
    description: text("description").notNull().default(""),
  },
  (t) => [index("skills_category_idx").on(t.categoryId)],
);

export const skillPrerequisites = pgTable(
  "skill_prerequisites",
  {
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    prerequisiteId: uuid("prerequisite_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.skillId, t.prerequisiteId] })],
);

export const competencies = pgTable("competencies", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  nsqfBand: level("nsqf_band").notNull(),
  behavioural: boolean("behavioural").notNull().default(false),
});

export const competencySkills = pgTable(
  "competency_skills",
  {
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.competencyId, t.skillId] })],
);

export const rolesCatalog = pgTable("roles_catalog", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  family: text("family").notNull(),
  summary: text("summary").notNull().default(""),
  tools: jsonb("tools").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  behavioural: jsonb("behavioural")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  minEducation: text("min_education").notNull(),
  minExperienceMonths: smallint("min_experience_months").notNull().default(0),
  nsqfBand: level("nsqf_band").notNull(),
});

export const roleRequirements = pgTable(
  "role_requirements",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => rolesCatalog.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id),
    mandatory: boolean("mandatory").notNull().default(true),
    minLevel: level("min_level").notNull(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.competencyId] })],
);

export const roleSkills = pgTable(
  "role_skills",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => rolesCatalog.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    preferred: boolean("preferred").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.skillId] })],
);

export const learningResources = pgTable("learning_resources", {
  id: id(),
  title: text("title").notNull(),
  provider: text("provider").notNull(),
  kind: text("kind").notNull(), // course | project | assessment | mentorship | micro_credential
  hours: smallint("hours").notNull().default(0),
  url: text("url"),
  free: boolean("free").notNull().default(true),
  skillIds: jsonb("skill_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
});

// ── people ─────────────────────────────────────────────────────────────────

export const students = pgTable(
  "students",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    institutionId: uuid("institution_id")
      .notNull()
      .references(() => institutions.id),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    programme: text("programme").notNull(),
    graduationYear: smallint("graduation_year").notNull(),
    semester: smallint("semester").notNull(),
    cgpa: real("cgpa"),
    city: text("city").notNull(),
    headline: text("headline").notNull().default(""),
    targetRoleId: uuid("target_role_id").references(() => rolesCatalog.id),
    careerInterests: jsonb("career_interests")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: createdAt(),
  },
  (t) => [
    index("students_inst_idx").on(t.institutionId),
    index("students_dept_idx").on(t.departmentId),
    index("students_target_idx").on(t.targetRoleId),
  ],
);

export const faculty = pgTable(
  "faculty",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    institutionId: uuid("institution_id")
      .notNull()
      .references(() => institutions.id),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    designation: text("designation").notNull(),
    expertise: jsonb("expertise").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  },
  (t) => [index("faculty_inst_idx").on(t.institutionId)],
);

export const recruiters = pgTable(
  "recruiters",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
  },
  (t) => [index("recruiters_employer_idx").on(t.employerId)],
);

// ── competency profile ─────────────────────────────────────────────────────

export const studentSkills = pgTable(
  "student_skills",
  {
    id: id(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    selfRating: level("self_rating").notNull(),
    assessedLevel: level("assessed_level"),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("student_skill_uq").on(t.studentId, t.skillId)],
);

export const skillEvidence = pgTable(
  "skill_evidence",
  {
    id: id(),
    studentSkillId: uuid("student_skill_id")
      .notNull()
      .references(() => studentSkills.id, { onDelete: "cascade" }),
    kind: evidenceKindEnum("kind").notNull(),
    label: text("label").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    verifier: text("verifier"),
    refId: uuid("ref_id"),
  },
  (t) => [index("skill_evidence_ss_idx").on(t.studentSkillId)],
);

export const projects = pgTable(
  "projects",
  {
    id: id(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    url: text("url"),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    facultyVerifiedBy: text("faculty_verified_by"),
    skillIds: jsonb("skill_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  },
  (t) => [index("projects_student_idx").on(t.studentId)],
);

export const certifications = pgTable(
  "certifications",
  {
    id: id(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    issuer: text("issuer").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    credentialUrl: text("credential_url"),
    skillIds: jsonb("skill_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  },
  (t) => [index("certifications_student_idx").on(t.studentId)],
);

export const assessmentResults = pgTable(
  "assessment_results",
  {
    id: id(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    score: smallint("score").notNull(),
    level: level("level").notNull(),
    weakAreas: jsonb("weak_areas").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    adaptivePath: jsonb("adaptive_path").notNull().default(sql`'[]'::jsonb`),
    takenAt: createdAt(),
  },
  (t) => [index("assessment_results_student_idx").on(t.studentId)],
);

export const endorsements = pgTable(
  "endorsements",
  {
    id: id(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id),
    by: text("by").notNull(),
    role: text("role").notNull(), // faculty | industry
    organisation: text("organisation").notNull(),
    note: text("note").notNull().default(""),
    date: createdAt(),
  },
  (t) => [index("endorsements_student_idx").on(t.studentId)],
);

// ── opportunities & lifecycle ──────────────────────────────────────────────

export const opportunities = pgTable(
  "opportunities",
  {
    id: id(),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => rolesCatalog.id),
    title: text("title").notNull(),
    type: opportunityTypeEnum("type").notNull(),
    mode: workModeEnum("mode").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    durationMonths: smallint("duration_months"),
    stipendPerMonth: integer("stipend_per_month"),
    salaryLpa: real("salary_lpa"),
    openings: smallint("openings").notNull().default(1),
    description: text("description").notNull().default(""),
    extraSkillIds: jsonb("extra_skill_ids")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    requiresAssessment: boolean("requires_assessment").notNull().default(false),
    postedAt: createdAt(),
    deadline: timestamp("deadline", { withTimezone: true }),
  },
  (t) => [
    index("opportunities_employer_idx").on(t.employerId),
    index("opportunities_role_idx").on(t.roleId),
    index("opportunities_deadline_idx").on(t.deadline),
  ],
);

export const applications = pgTable(
  "applications",
  {
    id: id(),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").notNull().default("submitted"),
    matchAtApply: smallint("match_at_apply"),
    note: text("note"),
    appliedAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("application_uq").on(t.opportunityId, t.studentId),
    index("applications_student_idx").on(t.studentId),
    index("applications_status_idx").on(t.status),
  ],
);

export const internships = pgTable(
  "internships",
  {
    id: id(),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id),
    mentorName: text("mentor_name").notNull(),
    facultyMentorName: text("faculty_mentor_name").notNull(),
    status: internshipStatusEnum("status").notNull().default("active"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    objectives: jsonb("objectives").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    milestones: jsonb("milestones").notNull().default(sql`'[]'::jsonb`),
    weeklyLogs: jsonb("weekly_logs").notNull().default(sql`'[]'::jsonb`),
    skillDelta: jsonb("skill_delta").notNull().default(sql`'[]'::jsonb`),
    finalEvaluation: jsonb("final_evaluation"),
  },
  (t) => [index("internships_student_idx").on(t.studentId)],
);

export const collaborations = pgTable(
  "collaborations",
  {
    id: id(),
    type: collaborationTypeEnum("type").notNull(),
    stage: collaborationStageEnum("stage").notNull().default("requested"),
    institutionId: uuid("institution_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "cascade" }),
    facultyId: uuid("faculty_id").references(() => faculty.id),
    title: text("title").notNull(),
    outcome: text("outcome"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("collaborations_inst_idx").on(t.institutionId)],
);

export const credentials = pgTable(
  "credentials",
  {
    id: text("id").primaryKey(), // human-facing, e.g. KS-PASSPORT-...
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    kind: credentialKindEnum("kind").notNull(),
    title: text("title").notNull(),
    issuer: text("issuer").notNull(),
    competencyIds: jsonb("competency_ids")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    evidenceSummary: jsonb("evidence_summary")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    status: text("status").notNull().default("active"), // active | revoked
    checkCode: text("check_code").notNull(),
    issuedAt: createdAt(),
  },
  (t) => [index("credentials_student_idx").on(t.studentId)],
);

export const placementOutcomes = pgTable(
  "placement_outcomes",
  {
    id: id(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employers.id),
    roleId: uuid("role_id")
      .notNull()
      .references(() => rolesCatalog.id),
    type: text("type").notNull(), // placement | internship_conversion
    ctcLpa: real("ctc_lpa"),
    timeToOfferDays: smallint("time_to_offer_days"),
    readinessAtStart: smallint("readiness_at_start"),
    readinessAtOffer: smallint("readiness_at_offer"),
    skillGapClosed: smallint("skill_gap_closed"),
    offeredAt: createdAt(),
  },
  (t) => [index("placement_outcomes_student_idx").on(t.studentId)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    at: createdAt(),
    actorId: uuid("actor_id").references(() => users.id),
    actorLabel: text("actor_label").notNull(),
    actorRole: roleEnum("actor_role").notNull(),
    action: text("action").notNull(),
    subjectType: text("subject_type"),
    subjectId: text("subject_id"),
    metadata: jsonb("metadata"),
    ip: text("ip"),
  },
  (t) => [index("audit_logs_at_idx").on(t.at)],
);

/** Per-deployment engine configuration (match / readiness weights, thresholds). */
export const engineConfig = pgTable("engine_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: updatedAt(),
});

/** Lightweight connectivity probe used by /api/health. */
export const healthCheck = pgTable("health_check", {
  id: id(),
  label: text("label").notNull().default("ok"),
  checkedAt: createdAt(),
});

// ── a few relations (extend as query needs grow) ───────────────────────────

export const studentRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  institution: one(institutions, {
    fields: [students.institutionId],
    references: [institutions.id],
  }),
  department: one(departments, {
    fields: [students.departmentId],
    references: [departments.id],
  }),
  targetRole: one(rolesCatalog, {
    fields: [students.targetRoleId],
    references: [rolesCatalog.id],
  }),
  skills: many(studentSkills),
  projects: many(projects),
  applications: many(applications),
}));

export const opportunityRelations = relations(opportunities, ({ one, many }) => ({
  employer: one(employers, {
    fields: [opportunities.employerId],
    references: [employers.id],
  }),
  role: one(rolesCatalog, {
    fields: [opportunities.roleId],
    references: [rolesCatalog.id],
  }),
  applications: many(applications),
}));
