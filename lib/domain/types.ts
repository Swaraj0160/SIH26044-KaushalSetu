/**
 * KaushalSetu domain model.
 *
 * These types are the contract the whole app is written against. The demo build
 * fills them from `lib/demo/`; a production build fills them from Drizzle/Postgres
 * (`lib/db/schema.ts` mirrors these). Business logic in `lib/engines/` depends
 * only on these types, never on the data source.
 */

export type Id = string;

export type Role =
  "student" | "faculty" | "recruiter" | "institution_admin" | "super_admin";

/** NSQF-style proficiency scale, 1 (aware) … 8 (expert / can lead). */
export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type EvidenceKind =
  | "self_declared"
  | "assessment"
  | "project"
  | "certificate"
  | "faculty_verified"
  | "industry_verified";

export type EvidenceConfidence = "low" | "moderate" | "high" | "verified";

export type OpportunityType =
  "internship" | "job" | "apprenticeship" | "live_project" | "mentorship";

export type WorkMode = "onsite" | "hybrid" | "remote";

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "hired";

export type InternshipStatus = "active" | "completed" | "terminated";

export type CollaborationType =
  | "guest_lecture"
  | "workshop"
  | "live_project"
  | "research"
  | "faculty_training"
  | "consultancy"
  | "curriculum_review";

export type CollaborationStage =
  "requested" | "approved" | "active" | "completed";

export type DemandTrend = "surging" | "growing" | "stable" | "declining";

// ── Taxonomy ────────────────────────────────────────────────────────────────

export interface SkillCategory {
  id: Id;
  name: string;
  /** Broad family, e.g. "Digital & Data", "Ayurveda & Life Sciences". */
  cluster: string;
}

export interface Skill {
  id: Id;
  name: string;
  categoryId: Id;
  /** NOS/QP-style code where we align to an occupational standard (illustrative). */
  nosCode?: string;
  description: string;
  /** Skills this one builds on — used by the roadmap sequencer. */
  prerequisiteIds: Id[];
}

export interface Competency {
  id: Id;
  name: string;
  description: string;
  /** Skills that, together, constitute this competency. */
  skillIds: Id[];
  /** NSQF band this competency sits around. */
  nsqfBand: ProficiencyLevel;
  behavioural?: boolean;
}

// ── People & orgs ───────────────────────────────────────────────────────────

export interface Institution {
  id: Id;
  name: string;
  shortName: string;
  city: string;
  state: string;
  type: "ayush" | "engineering" | "university" | "polytechnic";
  established: number;
}

export interface Department {
  id: Id;
  institutionId: Id;
  name: string;
  code: string;
}

export interface Employer {
  id: Id;
  name: string;
  sector: string;
  city: string;
  state: string;
  verified: boolean;
  about: string;
}

export interface SkillEvidenceRef {
  kind: EvidenceKind;
  /** Free-text label, e.g. "Formulation QA capstone", "NPTEL certificate". */
  label: string;
  /** ISO date. */
  date: string;
  /** Verifier name where the kind implies one. */
  verifier?: string;
  /** Points to a project / certification / assessment id where applicable. */
  refId?: Id;
}

export interface StudentSkill {
  skillId: Id;
  selfRating: ProficiencyLevel;
  /** Deterministically derived from evidence + assessment (see engines/evidence). */
  assessedLevel?: ProficiencyLevel;
  evidence: SkillEvidenceRef[];
}

export interface Project {
  id: Id;
  studentId: Id;
  title: string;
  summary: string;
  skillIds: Id[];
  url?: string;
  date: string;
  facultyVerifiedBy?: string;
}

export interface Certification {
  id: Id;
  studentId: Id;
  name: string;
  issuer: string;
  date: string;
  skillIds: Id[];
  credentialUrl?: string;
}

export interface AssessmentResult {
  id: Id;
  studentId: Id;
  skillId: Id;
  score: number; // 0–100
  level: ProficiencyLevel;
  takenAt: string;
  /** Sub-topics the attempt was weak on — feeds skill-gap detail. */
  weakAreas: string[];
  adaptivePath: Array<{
    difficulty: "easy" | "medium" | "hard";
    correct: boolean;
  }>;
}

export interface Endorsement {
  by: string;
  role: "faculty" | "industry";
  organisation: string;
  competencyId: Id;
  note: string;
  date: string;
}

export interface Student {
  id: Id;
  name: string;
  email: string;
  institutionId: Id;
  departmentId: Id;
  programme: string; // e.g. "B.Tech CSE", "BAMS"
  graduationYear: number;
  semester: number;
  cgpa: number;
  city: string;
  photoSeed: string;
  headline: string;
  careerInterests: Id[]; // role ids
  targetRoleId: Id;
  skills: StudentSkill[];
  endorsements: Endorsement[];
  /** Synthetic persona flag — surfaced in the UI. */
  demo: true;
}

export interface Faculty {
  id: Id;
  name: string;
  email: string;
  institutionId: Id;
  departmentId: Id;
  designation: string;
  expertise: Id[]; // skill ids
  industryEngagementScore: number; // 0–100, deterministic
}

export interface Recruiter {
  id: Id;
  name: string;
  email: string;
  employerId: Id;
  title: string;
}

// ── Opportunities & lifecycle ───────────────────────────────────────────────

export interface RoleRequirement {
  competencyId: Id;
  mandatory: boolean;
  minLevel: ProficiencyLevel;
}

export interface RoleProfile {
  id: Id;
  title: string;
  family: string; // "Data & AI", "Regulatory & Quality", …
  summary: string;
  requirements: RoleRequirement[];
  mandatorySkillIds: Id[];
  preferredSkillIds: Id[];
  tools: string[];
  behavioural: string[];
  minEducation: string;
  minExperienceMonths: number;
  nsqfBand: ProficiencyLevel;
}

export interface Opportunity {
  id: Id;
  employerId: Id;
  roleId: Id;
  title: string;
  type: OpportunityType;
  mode: WorkMode;
  city: string;
  state: string;
  durationMonths?: number;
  stipendPerMonth?: number;
  salaryLpa?: number;
  openings: number;
  postedAt: string;
  deadline: string;
  description: string;
  /** Extra skills beyond the role profile that this specific posting wants. */
  extraSkillIds: Id[];
  requiresAssessment: boolean;
  demo: true;
}

export interface Application {
  id: Id;
  opportunityId: Id;
  studentId: Id;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  /** Snapshot of the match score at apply time. */
  matchAtApply: number;
  note?: string;
}

export interface Internship {
  id: Id;
  opportunityId: Id;
  studentId: Id;
  employerId: Id;
  mentorName: string;
  facultyMentorName: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string;
  objectives: string[];
  milestones: Array<{ title: string; due: string; done: boolean }>;
  weeklyLogs: Array<{ week: number; summary: string; mentorRating: number }>;
  skillDelta: Array<{
    skillId: Id;
    before: ProficiencyLevel;
    after: ProficiencyLevel;
  }>;
  finalEvaluation?: {
    score: number;
    verdict: string;
    verifiedCompetencyIds: Id[];
  };
}

export interface Collaboration {
  id: Id;
  type: CollaborationType;
  stage: CollaborationStage;
  institutionId: Id;
  employerId: Id;
  facultyId?: Id;
  title: string;
  createdAt: string;
  updatedAt: string;
  outcome?: string;
}

export interface Credential {
  id: Id; // used in /verify/[id]
  studentId: Id;
  kind: "competency_passport" | "internship_certificate" | "assessment_badge";
  title: string;
  issuer: string;
  issuedAt: string;
  competencyIds: Id[];
  evidenceSummary: string[];
  status: "active" | "revoked";
  /** Deterministic non-cryptographic check code shown in the UI as a demo. */
  checkCode: string;
}

export interface PlacementOutcome {
  id: Id;
  studentId: Id;
  employerId: Id;
  roleId: Id;
  type: "placement" | "internship_conversion";
  ctcLpa: number;
  offeredAt: string;
  timeToOfferDays: number;
  readinessAtStart: number;
  readinessAtOffer: number;
  skillGapClosed: number; // count of gap items closed
}

export interface LearningResource {
  id: Id;
  title: string;
  provider: string;
  kind: "course" | "project" | "assessment" | "mentorship" | "micro_credential";
  skillIds: Id[];
  hours: number;
  url?: string;
  free: boolean;
}

export interface AuditEntry {
  id: Id;
  at: string;
  actor: string;
  actorRole: Role;
  action: string;
  subject: string;
}
