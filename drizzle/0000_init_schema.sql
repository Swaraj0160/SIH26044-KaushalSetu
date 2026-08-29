CREATE TYPE "public"."application_status" AS ENUM('submitted', 'under_review', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn', 'hired');--> statement-breakpoint
CREATE TYPE "public"."collaboration_stage" AS ENUM('requested', 'approved', 'active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."collaboration_type" AS ENUM('guest_lecture', 'workshop', 'live_project', 'research', 'faculty_training', 'consultancy', 'curriculum_review');--> statement-breakpoint
CREATE TYPE "public"."credential_kind" AS ENUM('competency_passport', 'internship_certificate', 'assessment_badge');--> statement-breakpoint
CREATE TYPE "public"."evidence_kind" AS ENUM('self_declared', 'assessment', 'project', 'certificate', 'faculty_verified', 'industry_verified');--> statement-breakpoint
CREATE TYPE "public"."institution_type" AS ENUM('ayush', 'engineering', 'university', 'polytechnic');--> statement-breakpoint
CREATE TYPE "public"."internship_status" AS ENUM('active', 'completed', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('internship', 'job', 'apprenticeship', 'live_project', 'mentorship');--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('student', 'faculty', 'recruiter', 'institution_admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('onsite', 'hybrid', 'remote');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"match_at_apply" smallint,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"score" smallint NOT NULL,
	"level" smallint NOT NULL,
	"weak_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"adaptive_path" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_id" uuid,
	"actor_label" text NOT NULL,
	"actor_role" "app_role" NOT NULL,
	"action" text NOT NULL,
	"subject_type" text,
	"subject_id" text,
	"metadata" jsonb,
	"ip" text
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"credential_url" text,
	"skill_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaborations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "collaboration_type" NOT NULL,
	"stage" "collaboration_stage" DEFAULT 'requested' NOT NULL,
	"institution_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"faculty_id" uuid,
	"title" text NOT NULL,
	"outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"nsqf_band" smallint NOT NULL,
	"behavioural" boolean DEFAULT false NOT NULL,
	CONSTRAINT "competencies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "competency_skills" (
	"competency_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "competency_skills_competency_id_skill_id_pk" PRIMARY KEY("competency_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"kind" "credential_kind" NOT NULL,
	"title" text NOT NULL,
	"issuer" text NOT NULL,
	"competency_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence_summary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"check_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sector" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"about" text DEFAULT '' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "endorsements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"by" text NOT NULL,
	"role" text NOT NULL,
	"organisation" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engine_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"institution_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"designation" text NOT NULL,
	"expertise" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_check" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text DEFAULT 'ok' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"type" "institution_type" NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"established" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"mentor_name" text NOT NULL,
	"faculty_mentor_name" text NOT NULL,
	"status" "internship_status" DEFAULT 'active' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"milestones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"weekly_logs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skill_delta" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"final_evaluation" jsonb
);
--> statement-breakpoint
CREATE TABLE "learning_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"provider" text NOT NULL,
	"kind" text NOT NULL,
	"hours" smallint DEFAULT 0 NOT NULL,
	"url" text,
	"free" boolean DEFAULT true NOT NULL,
	"skill_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "opportunity_type" NOT NULL,
	"mode" "work_mode" NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"duration_months" smallint,
	"stipend_per_month" integer,
	"salary_lpa" real,
	"openings" smallint DEFAULT 1 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"extra_skill_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requires_assessment" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deadline" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "placement_outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"type" text NOT NULL,
	"ctc_lpa" real,
	"time_to_offer_days" smallint,
	"readiness_at_start" smallint,
	"readiness_at_offer" smallint,
	"skill_gap_closed" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"url" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"faculty_verified_by" text,
	"skill_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruiters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_requirements" (
	"role_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"mandatory" boolean DEFAULT true NOT NULL,
	"min_level" smallint NOT NULL,
	CONSTRAINT "role_requirements_role_id_competency_id_pk" PRIMARY KEY("role_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "role_skills" (
	"role_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"preferred" boolean DEFAULT false NOT NULL,
	CONSTRAINT "role_skills_role_id_skill_id_pk" PRIMARY KEY("role_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "roles_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"family" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"tools" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"behavioural" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"min_education" text NOT NULL,
	"min_experience_months" smallint DEFAULT 0 NOT NULL,
	"nsqf_band" smallint NOT NULL,
	CONSTRAINT "roles_catalog_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "skill_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cluster" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_skill_id" uuid NOT NULL,
	"kind" "evidence_kind" NOT NULL,
	"label" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"verifier" text,
	"ref_id" uuid
);
--> statement-breakpoint
CREATE TABLE "skill_prerequisites" (
	"skill_id" uuid NOT NULL,
	"prerequisite_id" uuid NOT NULL,
	CONSTRAINT "skill_prerequisites_skill_id_prerequisite_id_pk" PRIMARY KEY("skill_id","prerequisite_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category_id" uuid NOT NULL,
	"nos_code" text,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "student_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"self_rating" smallint NOT NULL,
	"assessed_level" smallint,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"institution_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"programme" text NOT NULL,
	"graduation_year" smallint NOT NULL,
	"semester" smallint NOT NULL,
	"cgpa" real,
	"city" text NOT NULL,
	"headline" text DEFAULT '' NOT NULL,
	"target_role_id" uuid,
	"career_interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "app_role" DEFAULT 'student' NOT NULL,
	"full_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_skills" ADD CONSTRAINT "competency_skills_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_skills" ADD CONSTRAINT "competency_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_role_id_roles_catalog_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_outcomes" ADD CONSTRAINT "placement_outcomes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_outcomes" ADD CONSTRAINT "placement_outcomes_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_outcomes" ADD CONSTRAINT "placement_outcomes_role_id_roles_catalog_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_requirements" ADD CONSTRAINT "role_requirements_role_id_roles_catalog_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_requirements" ADD CONSTRAINT "role_requirements_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_skills" ADD CONSTRAINT "role_skills_role_id_roles_catalog_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_skills" ADD CONSTRAINT "role_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_evidence" ADD CONSTRAINT "skill_evidence_student_skill_id_student_skills_id_fk" FOREIGN KEY ("student_skill_id") REFERENCES "public"."student_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_prerequisites" ADD CONSTRAINT "skill_prerequisites_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_prerequisites" ADD CONSTRAINT "skill_prerequisites_prerequisite_id_skills_id_fk" FOREIGN KEY ("prerequisite_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_skill_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_target_role_id_roles_catalog_id_fk" FOREIGN KEY ("target_role_id") REFERENCES "public"."roles_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_uq" ON "applications" USING btree ("opportunity_id","student_id");--> statement-breakpoint
CREATE INDEX "applications_student_idx" ON "applications" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assessment_results_student_idx" ON "assessment_results" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "audit_logs_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "certifications_student_idx" ON "certifications" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "collaborations_inst_idx" ON "collaborations" USING btree ("institution_id");--> statement-breakpoint
CREATE INDEX "credentials_student_idx" ON "credentials" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "departments_inst_idx" ON "departments" USING btree ("institution_id");--> statement-breakpoint
CREATE INDEX "employers_verified_idx" ON "employers" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "endorsements_student_idx" ON "endorsements" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "faculty_inst_idx" ON "faculty" USING btree ("institution_id");--> statement-breakpoint
CREATE INDEX "internships_student_idx" ON "internships" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "opportunities_employer_idx" ON "opportunities" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "opportunities_role_idx" ON "opportunities" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "opportunities_deadline_idx" ON "opportunities" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "placement_outcomes_student_idx" ON "placement_outcomes" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "projects_student_idx" ON "projects" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "recruiters_employer_idx" ON "recruiters" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "skill_evidence_ss_idx" ON "skill_evidence" USING btree ("student_skill_id");--> statement-breakpoint
CREATE INDEX "skills_category_idx" ON "skills" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_skill_uq" ON "student_skills" USING btree ("student_id","skill_id");--> statement-breakpoint
CREATE INDEX "students_inst_idx" ON "students" USING btree ("institution_id");--> statement-breakpoint
CREATE INDEX "students_dept_idx" ON "students" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "students_target_idx" ON "students" USING btree ("target_role_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");