/**
 * Deterministic synthetic-data generator for the KaushalSetu demo.
 *
 * Everything here is clearly labelled synthetic in the UI. Records are causally
 * linked (a student's skills → assessments → evidence → target role → gaps →
 * opportunities → applications → internship → verified competency → passport →
 * institution readiness) so the demo tells one coherent story rather than showing
 * disconnected rows.
 */

import { Rng, isoDaysAgo, isoDaysAhead } from "./rng";
import { learningResources, roleById, roles, skillById } from "./taxonomy";
import type {
  Application,
  ApplicationStatus,
  AuditEntry,
  Certification,
  Collaboration,
  CollaborationStage,
  CollaborationType,
  Credential,
  Department,
  Employer,
  Endorsement,
  Faculty,
  Id,
  Institution,
  Internship,
  Opportunity,
  OpportunityType,
  PlacementOutcome,
  ProficiencyLevel,
  Project,
  Recruiter,
  Student,
  StudentSkill,
} from "@/lib/domain/types";

const FIRST = [
  "Aarav",
  "Ananya",
  "Vivaan",
  "Diya",
  "Aditya",
  "Ishaan",
  "Saanvi",
  "Kabir",
  "Myra",
  "Reyansh",
  "Anaya",
  "Arjun",
  "Aadhya",
  "Vihaan",
  "Pari",
  "Krishna",
  "Riya",
  "Rohan",
  "Meera",
  "Dev",
  "Kiara",
  "Aryan",
  "Navya",
  "Shaurya",
  "Ira",
  "Atharv",
  "Sara",
  "Advik",
  "Anvi",
  "Yuvraj",
  "Prisha",
  "Kayra",
  "Rudra",
  "Zara",
  "Ayaan",
  "Mahika",
  "Neil",
  "Tara",
  "Om",
  "Nitya",
];
const LAST = [
  "Sharma",
  "Nair",
  "Iyer",
  "Patel",
  "Reddy",
  "Menon",
  "Gupta",
  "Rao",
  "Singh",
  "Krishnan",
  "Bose",
  "Chauhan",
  "Deshmukh",
  "Pillai",
  "Joshi",
  "Kulkarni",
  "Bhat",
  "Verma",
  "Mehta",
  "Das",
];

const CITIES = [
  ["Pune", "Maharashtra"],
  ["Bengaluru", "Karnataka"],
  ["Hyderabad", "Telangana"],
  ["New Delhi", "Delhi"],
  ["Jaipur", "Rajasthan"],
  ["Ahmedabad", "Gujarat"],
  ["Chennai", "Tamil Nadu"],
  ["Bhopal", "Madhya Pradesh"],
] as const;

export interface DemoData {
  institutions: Institution[];
  departments: Department[];
  employers: Employer[];
  recruiters: Recruiter[];
  faculty: Faculty[];
  students: Student[];
  projects: Project[];
  certifications: Certification[];
  opportunities: Opportunity[];
  applications: Application[];
  internships: Internship[];
  collaborations: Collaboration[];
  credentials: Credential[];
  placements: PlacementOutcome[];
  audit: AuditEntry[];
}

export function generate(): DemoData {
  const rng = new Rng(26044);

  // ── Institutions & departments ─────────────────────────────────────────
  const institutions: Institution[] = [
    {
      id: "inst-aiia",
      name: "All India Institute of Ayurveda",
      shortName: "AIIA",
      city: "New Delhi",
      state: "Delhi",
      type: "ayush",
      established: 2017,
    },
    {
      id: "inst-bhu-ayur",
      name: "Faculty of Ayurveda, IMS BHU",
      shortName: "IMS-BHU",
      city: "Varanasi",
      state: "Uttar Pradesh",
      type: "ayush",
      established: 1927,
    },
    {
      id: "inst-gtu",
      name: "Gujarat Ayurved University",
      shortName: "GAU",
      city: "Jamnagar",
      state: "Gujarat",
      type: "ayush",
      established: 1967,
    },
    {
      id: "inst-coep",
      name: "College of Engineering Pune",
      shortName: "COEP",
      city: "Pune",
      state: "Maharashtra",
      type: "engineering",
      established: 1854,
    },
    {
      id: "inst-vit",
      name: "Vellore Institute of Technology",
      shortName: "VIT",
      city: "Vellore",
      state: "Tamil Nadu",
      type: "engineering",
      established: 1984,
    },
    {
      id: "inst-du",
      name: "University of Delhi",
      shortName: "DU",
      city: "New Delhi",
      state: "Delhi",
      type: "university",
      established: 1922,
    },
    {
      id: "inst-manipal",
      name: "Manipal Academy of Higher Education",
      shortName: "MAHE",
      city: "Manipal",
      state: "Karnataka",
      type: "university",
      established: 1953,
    },
    {
      id: "inst-gov-poly",
      name: "Government Polytechnic Nagpur",
      shortName: "GPN",
      city: "Nagpur",
      state: "Maharashtra",
      type: "polytechnic",
      established: 1914,
    },
  ];

  const deptDefs: Array<[Id, string, string, Institution["type"][]]> = [
    [
      "cse",
      "Computer Science & Engineering",
      "CSE",
      ["engineering", "university", "polytechnic"],
    ],
    [
      "ece",
      "Electronics & Communication",
      "ECE",
      ["engineering", "polytechnic"],
    ],
    ["mech", "Mechanical Engineering", "MECH", ["engineering", "polytechnic"]],
    ["stats", "Statistics & Data Science", "STAT", ["university"]],
    ["mgmt", "Management Studies", "MGMT", ["university", "engineering"]],
    ["rasashastra", "Rasashastra & Bhaishajya Kalpana", "RSBK", ["ayush"]],
    ["dravyaguna", "Dravyaguna Vigyan", "DG", ["ayush"]],
    ["kayachikitsa", "Kayachikitsa", "KC", ["ayush"]],
    ["panchakarma", "Panchakarma", "PK", ["ayush"]],
    ["pharmacy-ayush", "Ayurvedic Pharmacy", "APH", ["ayush"]],
  ];
  const departments: Department[] = [];
  for (const inst of institutions) {
    for (const [slug, name, code, types] of deptDefs) {
      if (types.includes(inst.type)) {
        departments.push({
          id: `dept-${inst.id}-${slug}`,
          institutionId: inst.id,
          name,
          code,
        });
      }
    }
  }
  const deptsByInst = (id: Id) =>
    departments.filter((d) => d.institutionId === id);

  // ── Employers & recruiters ────────────────────────────────────────────
  const employerDefs: Array<[Id, string, string, string, string, string]> = [
    [
      "emp-vedalabs",
      "VedaLabs AI",
      "Ayurvedic Analytics & Telemedicine",
      "Bengaluru",
      "Karnataka",
      "Applies data science and NLP to Ayurvedic clinical and formulation data for wellness platforms.",
    ],
    [
      "emp-himveda",
      "HimVeda Formulations",
      "AYUSH Manufacturing",
      "Haridwar",
      "Uttarakhand",
      "GMP-certified manufacturer of classical and proprietary Ayurvedic medicines.",
    ],
    [
      "emp-nirogya",
      "Nirogya Wellness",
      "Wellness & Hospitality",
      "Jaipur",
      "Rajasthan",
      "Chain of Ayurvedic wellness retreats and OPD wellness centres.",
    ],
    [
      "emp-ayursci",
      "AyurSci Research",
      "Clinical Research (CRO)",
      "Pune",
      "Maharashtra",
      "Contract research organisation running GCP studies on Ayurvedic interventions.",
    ],
    [
      "emp-rasabio",
      "RasaBio Labs",
      "Herbal QC & Testing",
      "Ahmedabad",
      "Gujarat",
      "Independent quality-control and phytochemistry testing laboratory.",
    ],
    [
      "emp-sanjeevani",
      "Sanjeevani HealthTech",
      "Digital Health",
      "Hyderabad",
      "Telangana",
      "Builds patient-facing health apps with an integrative-medicine focus.",
    ],
    [
      "emp-brightgrid",
      "BrightGrid Analytics",
      "Analytics Services",
      "Pune",
      "Maharashtra",
      "Analytics and BI consultancy for mid-market Indian enterprises.",
    ],
    [
      "emp-quantfin",
      "QuantFin Systems",
      "FinTech",
      "Bengaluru",
      "Karnataka",
      "Risk and pricing analytics for lending and insurance.",
    ],
    [
      "emp-cropwise",
      "CropWise",
      "AgriTech",
      "Hyderabad",
      "Telangana",
      "Remote-sensing and ML for crop advisory, incl. medicinal-plant cultivation.",
    ],
    [
      "emp-medgraph",
      "MedGraph",
      "Health Data",
      "Chennai",
      "Tamil Nadu",
      "Clinical knowledge graphs and coding for hospital networks.",
    ],
    [
      "emp-shoppr",
      "Shoppr",
      "E-commerce",
      "Bengaluru",
      "Karnataka",
      "D2C marketplace; large product-analytics team.",
    ],
    [
      "emp-govdisha",
      "DISHA Digital (State e-Gov)",
      "Government / e-Governance",
      "Bhopal",
      "Madhya Pradesh",
      "State e-governance delivery unit building citizen services.",
    ],
    [
      "emp-ayushexport",
      "AyushExport Council Partner",
      "Regulatory Consulting",
      "New Delhi",
      "Delhi",
      "Advises manufacturers on ASU licensing, claims and export dossiers.",
    ],
    [
      "emp-greenleaf",
      "GreenLeaf Nutraceuticals",
      "Nutraceuticals",
      "Ahmedabad",
      "Gujarat",
      "Herbal supplements and nutraceutical formulations for domestic and export markets.",
    ],
    [
      "emp-wellcare",
      "WellCare Hospitals",
      "Integrative Healthcare",
      "Kochi",
      "Kerala",
      "Multi-specialty hospital group with an integrative-medicine department.",
    ],
    [
      "emp-datasetu",
      "DataSetu",
      "Data Engineering",
      "Pune",
      "Maharashtra",
      "Data-platform engineering for public-sector and health clients.",
    ],
  ];
  const employers: Employer[] = employerDefs.map(
    ([id, name, sector, city, state, about]) => ({
      id,
      name,
      sector,
      city,
      state,
      about,
      verified: rng.chance(0.82),
    }),
  );
  employers.find((e) => e.id === "emp-vedalabs")!.verified = true;
  employers.find((e) => e.id === "emp-himveda")!.verified = true;

  const recruiters: Recruiter[] = [];
  for (const e of employers) {
    const n = rng.int(1, 2);
    for (let i = 0; i < n; i++) {
      recruiters.push({
        id: `rec-${e.id}-${i}`,
        name: `${rng.pick(FIRST)} ${rng.pick(LAST)}`,
        email: `talent${i > 0 ? i + 1 : ""}@${e.id.replace("emp-", "")}.example.in`,
        employerId: e.id,
        title: rng.pick([
          "Talent Lead",
          "Head of Talent",
          "Campus Hiring Manager",
          "People Partner",
        ]),
      });
    }
  }
  // Named recruiter persona
  recruiters.unshift({
    id: "rec-persona",
    name: "Rohan Mehta",
    email: "rohan.mehta@vedalabs.example.in",
    employerId: "emp-vedalabs",
    title: "Head of Talent",
  });

  // ── Faculty ───────────────────────────────────────────────────────────
  const faculty: Faculty[] = [];
  const facultyExpertisePools: Record<string, Id[]> = {
    ayush: [
      "sk-ayur-pharma",
      "sk-dravyaguna",
      "sk-herbal-id",
      "sk-gmp",
      "sk-ayur-diag",
      "sk-panchakarma",
      "sk-clin-research",
      "sk-reg-ayush",
    ],
    engineering: [
      "sk-ml",
      "sk-python-data",
      "sk-sql",
      "sk-react",
      "sk-stats",
      "sk-mlops",
      "sk-api",
    ],
    university: [
      "sk-stats",
      "sk-python-data",
      "sk-market-analysis",
      "sk-lit-review",
      "sk-experiment",
    ],
    polytechnic: ["sk-js", "sk-git", "sk-sql", "sk-testing"],
  };
  for (const inst of institutions) {
    const pool = facultyExpertisePools[inst.type];
    const count = inst.type === "ayush" ? 2 : 2;
    for (let i = 0; i < count; i++) {
      const d = rng.pick(deptsByInst(inst.id));
      faculty.push({
        id: `fac-${inst.id}-${i}`,
        name: `Dr. ${rng.pick(FIRST)} ${rng.pick(LAST)}`,
        email: `faculty${i}@${inst.shortName.toLowerCase()}.example.in`,
        institutionId: inst.id,
        departmentId: d.id,
        designation: rng.pick([
          "Assistant Professor",
          "Associate Professor",
          "Professor",
          "Head of Department",
        ]),
        expertise: rng.sample(pool, 4),
        industryEngagementScore: rng.int(35, 92),
      });
    }
  }
  // Faculty persona
  const personaInst = institutions.find((i) => i.id === "inst-coep")!;
  faculty.unshift({
    id: "fac-persona",
    name: "Prof. Meera Krishnan",
    email: "meera.krishnan@coep.example.in",
    institutionId: personaInst.id,
    departmentId: `dept-${personaInst.id}-cse`,
    designation: "Associate Professor & Industry Relations Chair",
    expertise: ["sk-ml", "sk-python-data", "sk-mlops", "sk-stats"],
    industryEngagementScore: 88,
  });

  // ── Students ──────────────────────────────────────────────────────────
  const students: Student[] = [];
  const projects: Project[] = [];
  const certifications: Certification[] = [];

  const pushStudent = (
    s: Student,
    ps: Project[] = [],
    cs: Certification[] = [],
  ) => {
    students.push(s);
    projects.push(...ps);
    certifications.push(...cs);
  };

  // Hero persona 1 — Aarav Sharma (the section-50 narrative)
  pushStudent(
    heroAarav(),
    [
      {
        id: "proj-aarav-1",
        studentId: "stu-aarav",
        title: "Churn prediction for a telecom dataset",
        summary:
          "End-to-end ML pipeline: EDA, feature engineering, gradient-boosted model, ROC-AUC 0.88, held-out evaluation.",
        skillIds: ["sk-ml", "sk-python-data", "sk-featureeng", "sk-stats"],
        date: isoDaysAgo(120),
        facultyVerifiedBy: "Prof. Meera Krishnan",
        url: "https://example.com/aarav/churn",
      },
      {
        id: "proj-aarav-2",
        studentId: "stu-aarav",
        title: "Movie-review sentiment classifier",
        summary:
          "Fine-tuned a small transformer for sentiment; wrote an evaluation report comparing to a TF-IDF baseline.",
        skillIds: ["sk-nlp", "sk-ml", "sk-python-data"],
        date: isoDaysAgo(64),
        facultyVerifiedBy: "Prof. Meera Krishnan",
      },
    ],
    [
      {
        id: "cert-aarav-1",
        studentId: "stu-aarav",
        name: "Introduction to Machine Learning",
        issuer: "NPTEL / IIT Madras",
        date: isoDaysAgo(150),
        skillIds: ["sk-ml", "sk-stats"],
        credentialUrl: "https://nptel.example.in/verify/abc",
      },
    ],
  );

  // Hero persona 2 — Dr. Ananya Nair (Ayush QA narrative)
  pushStudent(
    heroAnanya(),
    [
      {
        id: "proj-ananya-1",
        studentId: "stu-ananya",
        title:
          "Comparative pharmacognostic study of three market samples of Ashwagandha churna",
        summary:
          "Macroscopic + microscopic + basic HPTLC fingerprint comparison against pharmacopoeial standards; documented deviations.",
        skillIds: ["sk-herbal-id", "sk-dravyaguna", "sk-qc-lab"],
        date: isoDaysAgo(96),
        facultyVerifiedBy: "Dr. Anaya Bose",
      },
      {
        id: "proj-ananya-2",
        studentId: "stu-ananya",
        title: "Batch manufacturing record review — Triphala tablet",
        summary:
          "Reviewed a BMR against Schedule T requirements and flagged documentation gaps in in-process checks.",
        skillIds: ["sk-gmp", "sk-ayur-pharma"],
        date: isoDaysAgo(40),
      },
    ],
    [
      {
        id: "cert-ananya-1",
        studentId: "stu-ananya",
        name: "GMP for AYUSH Manufacturing",
        issuer: "Industry Partner (HimVeda)",
        date: isoDaysAgo(70),
        skillIds: ["sk-gmp"],
      },
    ],
  );

  // Generated crowd. Concentrated at the two persona institutions (COEP, AIIA)
  // so their dashboards are rich, with a realistic tail across the rest.
  const targetRolePool = roles.map((r) => r.id);
  const instWeighted: Institution[] = [
    ...Array(22).fill(institutions.find((x) => x.id === "inst-coep")!),
    ...Array(16).fill(institutions.find((x) => x.id === "inst-aiia")!),
    ...Array(4).fill(institutions.find((x) => x.id === "inst-bhu-ayur")!),
    ...Array(4).fill(institutions.find((x) => x.id === "inst-vit")!),
    ...Array(3).fill(institutions.find((x) => x.id === "inst-gtu")!),
    ...Array(3).fill(institutions.find((x) => x.id === "inst-du")!),
    ...Array(3).fill(institutions.find((x) => x.id === "inst-manipal")!),
    ...Array(3).fill(institutions.find((x) => x.id === "inst-coep")!),
  ];
  for (let i = 0; i < 64; i++) {
    const inst = rng.pick(instWeighted);
    const dept = rng.pick(deptsByInst(inst.id));
    const isAyush = inst.type === "ayush";
    const gradYear = rng.pick([2026, 2026, 2027, 2025]);
    const name = `${rng.pick(FIRST)} ${rng.pick(LAST)}`;
    const [city, _state] = rng.pick(CITIES);
    void _state;
    const programme = isAyush
      ? rng.pick([
          "BAMS",
          "BAMS",
          "B.Pharm (Ayurveda)",
          "MD (Ayurveda) - Rasashastra",
        ])
      : inst.type === "engineering"
        ? rng.pick([
            "B.Tech CSE",
            "B.Tech ECE",
            "B.Tech IT",
            "B.Tech Mechanical",
          ])
        : inst.type === "polytechnic"
          ? rng.pick(["Diploma CSE", "Diploma ECE"])
          : rng.pick(["B.Sc Statistics", "BCA", "BBA", "M.Sc Data Science"]);

    const targetRoleId = isAyush
      ? rng.pick([
          "role-formulation-qa",
          "role-reg-affairs",
          "role-clin-research",
          "role-pv-associate",
          "role-wellness-designer",
          "role-med-content",
        ])
      : rng.pick([
          "role-ml-eng",
          "role-data-analyst",
          "role-data-scientist",
          "role-fullstack",
          "role-product-analyst",
          "role-supplychain-analyst",
        ]);
    const target = roleById.get(targetRoleId)!;

    // How developed this student is. Skewed toward "reasonably prepared final
    // years who have been on the platform a while" so dashboards aren't bleak,
    // with a genuine tail of under-prepared students.
    const strength = Math.max(
      0.3,
      Math.min(0.98, 0.46 + rng.float(0, 0.42) + (gradYear <= 2026 ? 0.12 : 0)),
    );
    const sSkills = buildStudentSkills(rng, target, strength, isAyush);

    const id = `stu-${i}`;
    const stuProjects: Project[] = [];
    const projCount = rng.int(0, 3);
    for (let p = 0; p < projCount; p++) {
      const sids = rng.sample(
        sSkills.map((s) => s.skillId),
        rng.int(1, 3),
      );
      stuProjects.push({
        id: `proj-${id}-${p}`,
        studentId: id,
        title: projectTitle(rng, sids),
        summary:
          "Course / self-directed project applying the listed skills to a scoped problem.",
        skillIds: sids,
        date: isoDaysAgo(rng.int(20, 300)),
        facultyVerifiedBy: rng.chance(0.45)
          ? `Dr. ${rng.pick(LAST)}`
          : undefined,
      });
    }
    const stuCerts: Certification[] = [];
    if (rng.chance(0.5)) {
      const lr = rng.pick(learningResources);
      stuCerts.push({
        id: `cert-${id}-0`,
        studentId: id,
        name: lr.title,
        issuer: lr.provider,
        date: isoDaysAgo(rng.int(30, 400)),
        skillIds: lr.skillIds,
      });
    }

    const endorsements: Endorsement[] = [];
    if (strength > 0.6 && rng.chance(0.55)) {
      const comp = rng.pick(target.requirements).competencyId;
      endorsements.push({
        by: `Dr. ${rng.pick(LAST)}`,
        role: "faculty",
        organisation: inst.shortName,
        competencyId: comp,
        note: "Consistently strong in coursework and lab.",
        date: isoDaysAgo(rng.int(20, 200)),
      });
    }

    pushStudent(
      {
        id,
        name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${inst.shortName.toLowerCase()}.example.in`,
        institutionId: inst.id,
        departmentId: dept.id,
        programme,
        graduationYear: gradYear,
        semester: rng.int(4, 8),
        cgpa: rng.float(6.4, 9.3, 2),
        city,
        photoSeed: `${id}-${rng.int(1, 999)}`,
        headline: headline(rng, target, isAyush),
        careerInterests: rng
          .sample(
            targetRolePool.filter((r) => r !== targetRoleId),
            rng.int(1, 2),
          )
          .concat(targetRoleId),
        targetRoleId,
        skills: sSkills,
        endorsements,
        demo: true,
      },
      stuProjects,
      stuCerts,
    );
  }

  // ── Opportunities ─────────────────────────────────────────────────────
  const opportunities: Opportunity[] = [];
  const oppTypesByRole: Record<string, OpportunityType[]> = {
    "role-ml-eng": ["internship", "internship", "job"],
    "role-data-analyst": ["internship", "job", "internship"],
    "role-data-scientist": ["internship", "job"],
    "role-fullstack": ["internship", "job", "live_project"],
    "role-product-analyst": ["internship", "job"],
    "role-formulation-qa": [
      "internship",
      "internship",
      "job",
      "apprenticeship",
    ],
    "role-reg-affairs": ["internship", "job"],
    "role-clin-research": ["internship", "job", "live_project"],
    "role-pv-associate": ["internship", "job"],
    "role-wellness-designer": ["internship", "job"],
    "role-med-content": ["internship", "job", "live_project"],
    "role-supplychain-analyst": ["internship", "job"],
  };
  let oppN = 0;
  for (const emp of employers) {
    const roleChoices = employerRoles(emp.id);
    const count = rng.int(2, 4);
    for (let k = 0; k < count; k++) {
      const roleId = rng.pick(roleChoices);
      const role = roleById.get(roleId)!;
      const type = rng.pick(oppTypesByRole[roleId] ?? ["internship"]);
      const [city, state] = rng.chance(0.7)
        ? [emp.city, emp.state]
        : rng.pick(CITIES);
      const stipend =
        type === "internship" || type === "apprenticeship"
          ? rng.pick([8000, 10000, 12000, 15000, 18000, 20000, 25000])
          : undefined;
      const salary = type === "job" ? rng.float(3.5, 14, 1) : undefined;
      opportunities.push({
        id: `opp-${oppN++}`,
        employerId: emp.id,
        roleId,
        title: `${role.title}${type === "internship" ? " Intern" : type === "apprenticeship" ? " Apprentice" : ""} — ${emp.name}`,
        type,
        mode: rng.pick<Opportunity["mode"]>([
          "onsite",
          "hybrid",
          "hybrid",
          "remote",
        ]),
        city,
        state,
        durationMonths: type === "job" ? undefined : rng.pick([2, 3, 3, 6]),
        stipendPerMonth: stipend,
        salaryLpa: salary,
        openings: rng.int(1, 6),
        postedAt: isoDaysAgo(rng.int(2, 60)),
        deadline: isoDaysAhead(rng.int(4, 45)),
        description:
          `${emp.name} is hiring for a ${role.title.toLowerCase()} ${type === "job" ? "role" : "internship"}. ` +
          `You will work on ${rng.pick(["a live delivery", "an internal platform", "a client engagement", "a research study"])} ` +
          `alongside experienced mentors. Selection considers competency coverage and evidence, not just CGPA.`,
        extraSkillIds: rng.sample(role.preferredSkillIds, rng.int(0, 2)),
        requiresAssessment: rng.chance(0.55),
        demo: true,
      });
    }
  }
  // Guaranteed hero-facing opportunities
  opportunities.push({
    id: "opp-hero-ml",
    employerId: "emp-vedalabs",
    roleId: "role-ml-eng",
    title: "Machine Learning Engineer Intern — VedaLabs AI",
    type: "internship",
    mode: "hybrid",
    city: "Bengaluru",
    state: "Karnataka",
    durationMonths: 6,
    stipendPerMonth: 25000,
    salaryLpa: undefined,
    openings: 2,
    postedAt: isoDaysAgo(9),
    deadline: isoDaysAhead(12),
    description:
      "Work on model deployment and monitoring for VedaLabs' Ayurvedic clinical-NLP platform. You will containerise models, build a FastAPI serving layer, and set up drift monitoring with a senior mentor.",
    extraSkillIds: ["sk-docker", "sk-api"],
    requiresAssessment: true,
    demo: true,
  });
  opportunities.push({
    id: "opp-hero-qa",
    employerId: "emp-himveda",
    roleId: "role-formulation-qa",
    title: "Ayurvedic Formulation QA Analyst Intern — HimVeda Formulations",
    type: "internship",
    mode: "onsite",
    city: "Haridwar",
    state: "Uttarakhand",
    durationMonths: 3,
    stipendPerMonth: 15000,
    openings: 3,
    postedAt: isoDaysAgo(6),
    deadline: isoDaysAhead(18),
    description:
      "Join HimVeda's QA lab: raw-material authentication, in-process checks against Schedule T, HPTLC fingerprinting, and batch-record review under a QA manager.",
    extraSkillIds: ["sk-qc-lab", "sk-reg-ayush"],
    requiresAssessment: true,
    demo: true,
  });

  // ── Applications ──────────────────────────────────────────────────────
  const applications: Application[] = [];
  const statusFlow: ApplicationStatus[] = [
    "submitted",
    "under_review",
    "shortlisted",
    "interview",
    "offer",
    "rejected",
    "hired",
  ];
  let appN = 0;
  for (const stu of students) {
    if (stu.id === "stu-aarav" || stu.id === "stu-ananya") continue;
    const n = rng.int(0, 4);
    const pool = rng.sample(opportunities, n);
    for (const opp of pool) {
      applications.push({
        id: `app-${appN++}`,
        opportunityId: opp.id,
        studentId: stu.id,
        status: rng.pick(statusFlow),
        appliedAt: isoDaysAgo(rng.int(1, 40)),
        updatedAt: isoDaysAgo(rng.int(0, 20)),
        matchAtApply: rng.int(38, 94),
      });
    }
  }
  // Hero applications
  applications.push(
    {
      id: "app-hero-1",
      opportunityId: "opp-hero-ml",
      studentId: "stu-aarav",
      status: "shortlisted",
      appliedAt: isoDaysAgo(7),
      updatedAt: isoDaysAgo(2),
      matchAtApply: 78,
      note: "Strong ML fundamentals; deployment gap flagged.",
    },
    {
      id: "app-hero-2",
      opportunityId: "opp-2",
      studentId: "stu-aarav",
      status: "under_review",
      appliedAt: isoDaysAgo(4),
      updatedAt: isoDaysAgo(1),
      matchAtApply: 71,
    },
    {
      id: "app-hero-3",
      opportunityId: "opp-hero-qa",
      studentId: "stu-ananya",
      status: "interview",
      appliedAt: isoDaysAgo(5),
      updatedAt: isoDaysAgo(1),
      matchAtApply: 74,
    },
  );

  // ── Internships (incl. hero active internship) ────────────────────────
  const internships: Internship[] = [];
  const hiredApps = applications.filter((a) => a.status === "hired");
  let intN = 0;
  for (const a of hiredApps.slice(0, 20)) {
    const opp = opportunities.find((o) => o.id === a.opportunityId)!;
    const role = roleById.get(opp.roleId)!;
    const done = rng.chance(0.6);
    const skillDelta = rng
      .sample(role.mandatorySkillIds, rng.int(1, 3))
      .map((sid) => {
        const before = rng.weightedLevel(3, 1) as ProficiencyLevel;
        return {
          skillId: sid,
          before,
          after: Math.min(8, before + rng.int(1, 2)) as ProficiencyLevel,
        };
      });
    internships.push({
      id: `int-${intN++}`,
      opportunityId: opp.id,
      studentId: a.studentId,
      employerId: opp.employerId,
      mentorName: `${rng.pick(FIRST)} ${rng.pick(LAST)}`,
      facultyMentorName: `Dr. ${rng.pick(LAST)}`,
      status: done ? "completed" : "active",
      startDate: isoDaysAgo(done ? rng.int(120, 200) : rng.int(20, 60)),
      endDate: done
        ? isoDaysAgo(rng.int(10, 60))
        : isoDaysAhead(rng.int(20, 90)),
      objectives: [
        "Contribute to a live deliverable",
        "Build one portfolio-grade artefact",
        "Close two role skill gaps",
      ],
      milestones: [
        {
          title: "Onboarding & scoping",
          due: isoDaysAgo(rng.int(5, 30)),
          done: true,
        },
        {
          title: "Mid-point review",
          due: isoDaysAhead(rng.int(5, 20)),
          done: done,
        },
        {
          title: "Final evaluation",
          due: isoDaysAhead(rng.int(25, 60)),
          done: done,
        },
      ],
      weeklyLogs: Array.from({ length: done ? 8 : rng.int(2, 5) }, (_, w) => ({
        week: w + 1,
        summary: rng.pick([
          "Set up environment and read existing code.",
          "Shipped first small change.",
          "Paired with mentor on the core task.",
          "Wrote tests and docs.",
          "Presented progress at team standup.",
        ]),
        mentorRating: rng.int(3, 5),
      })),
      skillDelta,
      finalEvaluation: done
        ? {
            score: rng.int(68, 95),
            verdict: rng.pick([
              "Exceeded expectations",
              "Met expectations",
              "Strong contributor",
            ]),
            verifiedCompetencyIds: rng.sample(
              role.requirements.map((r) => r.competencyId),
              rng.int(1, 2),
            ),
          }
        : undefined,
    });
  }
  // Hero active internship — Aarav at VedaLabs
  internships.push({
    id: "int-hero",
    opportunityId: "opp-hero-ml",
    studentId: "stu-aarav",
    employerId: "emp-vedalabs",
    mentorName: "Sridhar Iyer",
    facultyMentorName: "Prof. Meera Krishnan",
    status: "active",
    startDate: isoDaysAgo(26),
    endDate: isoDaysAhead(154),
    objectives: [
      "Containerise two production models and stand up a FastAPI serving layer",
      "Add drift monitoring with alerting",
      "Reach Practitioner level on MLOps & Model Deployment with verifiable evidence",
    ],
    milestones: [
      {
        title: "Environment + model containerised",
        due: isoDaysAgo(5),
        done: true,
      },
      {
        title: "Serving layer + tests in staging",
        due: isoDaysAhead(20),
        done: false,
      },
      {
        title: "Drift monitoring live + final review",
        due: isoDaysAhead(120),
        done: false,
      },
    ],
    weeklyLogs: [
      {
        week: 1,
        summary:
          "Onboarded, read the serving codebase, reproduced the training pipeline locally.",
        mentorRating: 4,
      },
      {
        week: 2,
        summary:
          "Wrote multi-stage Dockerfiles for both models; images build in CI.",
        mentorRating: 4,
      },
      {
        week: 3,
        summary:
          "Drafted the FastAPI serving layer with request validation; wrote unit tests.",
        mentorRating: 5,
      },
    ],
    skillDelta: [
      { skillId: "sk-docker", before: 2, after: 4 },
      { skillId: "sk-api", before: 3, after: 4 },
      { skillId: "sk-mlops", before: 2, after: 3 },
    ],
    finalEvaluation: undefined,
  });

  // ── Collaborations ───────────────────────────────────────────────────
  const collaborations: Collaboration[] = [];
  const collabTypes: CollaborationType[] = [
    "guest_lecture",
    "workshop",
    "live_project",
    "research",
    "faculty_training",
    "consultancy",
    "curriculum_review",
  ];
  const collabStages: CollaborationStage[] = [
    "requested",
    "approved",
    "active",
    "completed",
  ];
  for (let i = 0; i < 20; i++) {
    const inst = rng.pick(institutions);
    const emp = rng.pick(employers);
    const type = rng.pick(collabTypes);
    const stage = rng.pick(collabStages);
    collaborations.push({
      id: `col-${i}`,
      type,
      stage,
      institutionId: inst.id,
      employerId: emp.id,
      facultyId: rng.chance(0.6)
        ? rng.pick(faculty.filter((f) => f.institutionId === inst.id)).id
        : undefined,
      title: `${labelCollab(type)} — ${emp.name} × ${inst.shortName}`,
      createdAt: isoDaysAgo(rng.int(20, 180)),
      updatedAt: isoDaysAgo(rng.int(0, 20)),
      outcome:
        stage === "completed"
          ? rng.pick([
              "12 students trained; 3 offered internships",
              "Curriculum module updated for next semester",
              "Joint white-paper drafted",
              "2 faculty completed industry immersion",
            ])
          : undefined,
    });
  }
  collaborations.unshift({
    id: "col-persona",
    type: "live_project",
    stage: "active",
    institutionId: "inst-coep",
    employerId: "emp-vedalabs",
    facultyId: "fac-persona",
    title: "Live Project — VedaLabs AI × COEP: ML deployment capstone",
    createdAt: isoDaysAgo(40),
    updatedAt: isoDaysAgo(3),
    outcome: undefined,
  });

  // ── Credentials ──────────────────────────────────────────────────────
  const credentials: Credential[] = [];
  const completedInts = internships.filter(
    (i) => i.status === "completed" && i.finalEvaluation,
  );
  let credN = 0;
  for (const it of completedInts.slice(0, 16)) {
    const stu = students.find((s) => s.id === it.studentId)!;
    credentials.push({
      id: `KS-INT-${1000 + credN}`,
      studentId: stu.id,
      kind: "internship_certificate",
      title: `Internship Completion — ${roleById.get(opportunities.find((o) => o.id === it.opportunityId)!.roleId)!.title}`,
      issuer: employers.find((e) => e.id === it.employerId)!.name,
      issuedAt: it.endDate,
      competencyIds: it.finalEvaluation!.verifiedCompetencyIds,
      evidenceSummary: [
        `Final evaluation score ${it.finalEvaluation!.score}/100`,
        it.finalEvaluation!.verdict,
        `${it.weeklyLogs.length} verified weekly logs`,
      ],
      status: "active",
      checkCode: checkCode(`KS-INT-${1000 + credN}`),
    });
    credN++;
  }
  // Hero passport credential
  credentials.unshift({
    id: "KS-PASSPORT-AARAV",
    studentId: "stu-aarav",
    kind: "competency_passport",
    title: "Competency Passport — Aarav Sharma",
    issuer: "KaushalSetu (institution-attested: COEP)",
    issuedAt: isoDaysAgo(3),
    competencyIds: [
      "cmp-ml-engineering",
      "cmp-data-foundations",
      "cmp-analytical-thinking",
    ],
    evidenceSummary: [
      "ML Engineering — Advanced: 2 faculty-verified projects, NPTEL certificate, assessment 91/100",
      "Data Foundations — Practitioner: SQL + Python assessments, project evidence",
      "Analytical Thinking — Practitioner: Statistics assessment 82/100",
      "In progress: ML Delivery & Operations (active internship at VedaLabs AI)",
    ],
    status: "active",
    checkCode: checkCode("KS-PASSPORT-AARAV"),
  });
  credentials.push({
    id: "KS-ASSESS-ANANYA-GMP",
    studentId: "stu-ananya",
    kind: "assessment_badge",
    title: "Assessment Badge — GMP & Quality Systems (Working)",
    issuer: "KaushalSetu Assessment",
    issuedAt: isoDaysAgo(20),
    competencyIds: ["cmp-quality-assurance"],
    evidenceSummary: [
      "Assessment score 71/100",
      "Adaptive path reached hard tier",
      "Weak area: deviation & CAPA handling",
    ],
    status: "active",
    checkCode: checkCode("KS-ASSESS-ANANYA-GMP"),
  });

  // A competency-passport credential for every student, so /verify works for any
  // profile a judge navigates to. Competencies listed = the student's top three
  // by resolved level among their target-role requirements.
  for (const s of students) {
    if (s.id === "stu-aarav") continue; // already has a richer one
    const id = `KS-PASSPORT-${s.id.toUpperCase().replace("STU-", "")}`;
    credentials.push({
      id,
      studentId: s.id,
      kind: "competency_passport",
      title: `Competency Passport — ${s.name}`,
      issuer: `KaushalSetu (institution: ${
        institutions.find((i) => i.id === s.institutionId)?.shortName ?? "—"
      })`,
      issuedAt: isoDaysAgo(rng.int(1, 30)),
      competencyIds: roleById
        .get(s.targetRoleId)!
        .requirements.slice(0, 3)
        .map((r) => r.competencyId),
      evidenceSummary: [
        `Target role: ${roleById.get(s.targetRoleId)!.title}`,
        `${s.skills.length} skills on record`,
        `${s.endorsements.length} endorsement(s)`,
      ],
      status: "active",
      checkCode: checkCode(id),
    });
  }

  // ── Placement outcomes ───────────────────────────────────────────────
  const placements: PlacementOutcome[] = [];
  for (let i = 0; i < 28; i++) {
    const stu = rng.pick(students.filter((s) => s.graduationYear <= 2026));
    const role = roleById.get(stu.targetRoleId)!;
    const emp = rng.pick(employers);
    const rStart = rng.int(28, 62);
    const rOffer = Math.min(96, rStart + rng.int(12, 34));
    placements.push({
      id: `plc-${i}`,
      studentId: stu.id,
      employerId: emp.id,
      roleId: role.id,
      type: rng.chance(0.4) ? "internship_conversion" : "placement",
      ctcLpa:
        role.family === "Data & AI"
          ? rng.float(4.5, 16, 1)
          : rng.float(3.2, 9, 1),
      offeredAt: isoDaysAgo(rng.int(10, 240)),
      timeToOfferDays: rng.int(20, 160),
      readinessAtStart: rStart,
      readinessAtOffer: rOffer,
      skillGapClosed: rng.int(2, 7),
    });
  }

  // ── Audit log ────────────────────────────────────────────────────────
  const audit: AuditEntry[] = [];
  const auditActions = [
    [
      "Rohan Mehta",
      "recruiter",
      "Shortlisted candidate for opp-hero-ml",
      "stu-aarav",
    ],
    [
      "Prof. Meera Krishnan",
      "faculty",
      "Verified project evidence",
      "proj-aarav-2",
    ],
    [
      "Dr. S. Rao",
      "institution_admin",
      "Exported department readiness report",
      "inst-coep / CSE",
    ],
    [
      "System",
      "super_admin",
      "Recomputed match scores (weight config v3)",
      "matching-engine",
    ],
    ["HimVeda QA", "recruiter", "Issued internship credential", "KS-INT-1004"],
    ["Aarav Sharma", "student", "Submitted application", "opp-hero-ml"],
    [
      "Dr. Ananya Nair",
      "student",
      "Completed assessment: GMP & Quality Systems",
      "KS-ASSESS-ANANYA-GMP",
    ],
    ["Super Admin", "super_admin", "Verified employer", "emp-vedalabs"],
    [
      "Prof. Meera Krishnan",
      "faculty",
      "Approved live-project collaboration",
      "col-persona",
    ],
    [
      "Dr. S. Rao",
      "institution_admin",
      "Flagged critical skill gap: MLOps (CSE)",
      "inst-coep / CSE",
    ],
  ] as const;
  auditActions.forEach(([actor, role, action, subject], i) => {
    audit.push({
      id: `aud-${i}`,
      at: isoDaysAgo(i),
      actor,
      actorRole: role as AuditEntry["actorRole"],
      action,
      subject,
    });
  });

  return {
    institutions,
    departments,
    employers,
    recruiters,
    faculty,
    students,
    projects,
    certifications,
    opportunities,
    applications,
    internships,
    collaborations,
    credentials,
    placements,
    audit,
  };
}

// ── helpers ────────────────────────────────────────────────────────────────

function employerRoles(empId: Id): Id[] {
  const map: Record<string, Id[]> = {
    "emp-vedalabs": ["role-ml-eng", "role-data-scientist", "role-med-content"],
    "emp-himveda": [
      "role-formulation-qa",
      "role-reg-affairs",
      "role-supplychain-analyst",
    ],
    "emp-nirogya": ["role-wellness-designer", "role-med-content"],
    "emp-ayursci": [
      "role-clin-research",
      "role-pv-associate",
      "role-data-analyst",
    ],
    "emp-rasabio": ["role-formulation-qa", "role-supplychain-analyst"],
    "emp-sanjeevani": [
      "role-fullstack",
      "role-product-analyst",
      "role-med-content",
    ],
    "emp-brightgrid": ["role-data-analyst", "role-product-analyst"],
    "emp-quantfin": ["role-data-scientist", "role-data-analyst"],
    "emp-cropwise": ["role-ml-eng", "role-supplychain-analyst"],
    "emp-medgraph": [
      "role-data-analyst",
      "role-fullstack",
      "role-clin-research",
    ],
    "emp-shoppr": [
      "role-product-analyst",
      "role-fullstack",
      "role-data-analyst",
    ],
    "emp-govdisha": ["role-fullstack", "role-data-analyst"],
    "emp-ayushexport": ["role-reg-affairs", "role-med-content"],
    "emp-greenleaf": [
      "role-formulation-qa",
      "role-reg-affairs",
      "role-supplychain-analyst",
    ],
    "emp-wellcare": [
      "role-wellness-designer",
      "role-clin-research",
      "role-pv-associate",
    ],
    "emp-datasetu": ["role-fullstack", "role-data-analyst", "role-ml-eng"],
  };
  return map[empId] ?? ["role-data-analyst"];
}

function buildStudentSkills(
  rng: Rng,
  role: import("@/lib/domain/types").RoleProfile,
  strength: number,
  isAyush: boolean,
): StudentSkill[] {
  const roleSkills = [
    ...new Set([...role.mandatorySkillIds, ...role.preferredSkillIds]),
  ];
  const extraPool = (
    isAyush
      ? [
          "sk-comm",
          "sk-domain-writing",
          "sk-lit-review",
          "sk-project-mgmt",
          "sk-data-ethics",
        ]
      : ["sk-comm", "sk-git", "sk-problem-solving", "sk-project-mgmt", "sk-sql"]
  ).filter((s) => !roleSkills.includes(s));
  const chosen = [...roleSkills, ...rng.sample(extraPool, rng.int(1, 3))];

  return chosen.map((skillId) => {
    const centre = 1 + strength * 6;
    const selfRating = rng.weightedLevel(centre, 1.6) as ProficiencyLevel;
    const evidence: StudentSkill["evidence"] = [
      {
        kind: "self_declared",
        label: "Added by student",
        date: isoDaysAgo(rng.int(30, 300)),
      },
    ];
    // evidence accrues with strength + a bit of randomness
    if (rng.chance(strength * 0.9))
      evidence.push({
        kind: "assessment",
        label: "KaushalSetu skill assessment",
        date: isoDaysAgo(rng.int(10, 180)),
      });
    if (rng.chance(strength * 0.7))
      evidence.push({
        kind: "project",
        label: "Portfolio project",
        date: isoDaysAgo(rng.int(20, 260)),
      });
    if (rng.chance(strength * 0.4))
      evidence.push({
        kind: "certificate",
        label: "Course certificate",
        date: isoDaysAgo(rng.int(40, 400)),
      });
    if (rng.chance(strength * 0.35))
      evidence.push({
        kind: "faculty_verified",
        label: "Faculty endorsement",
        date: isoDaysAgo(rng.int(15, 150)),
        verifier: "Dept. faculty",
      });
    if (rng.chance(strength * 0.18))
      evidence.push({
        kind: "industry_verified",
        label: "Verified during internship",
        date: isoDaysAgo(rng.int(10, 120)),
        verifier: "Industry mentor",
      });

    const hasAssessment = evidence.some((e) => e.kind === "assessment");
    const assessedLevel = hasAssessment
      ? (Math.max(
          1,
          Math.min(8, selfRating + rng.int(-1, 1)),
        ) as ProficiencyLevel)
      : undefined;
    return { skillId, selfRating, assessedLevel, evidence };
  });
}

function projectTitle(rng: Rng, skillIds: Id[]): string {
  const s = skillById.get(skillIds[0])?.name ?? "a skill";
  return rng.pick([
    `Applied ${s} in a semester project`,
    `${s} case study`,
    `Mini-project: ${s} in practice`,
    `${s} — coursework deliverable`,
  ]);
}

function headline(
  rng: Rng,
  role: import("@/lib/domain/types").RoleProfile,
  isAyush: boolean,
): string {
  return isAyush
    ? rng.pick([
        `Aspiring ${role.title} · Ayurveda`,
        `BAMS · building toward ${role.title}`,
        `Ayush graduate targeting ${role.family}`,
      ])
    : rng.pick([
        `Aspiring ${role.title}`,
        `Building toward ${role.title}`,
        `${role.family} track · final year`,
      ]);
}

function labelCollab(t: CollaborationType): string {
  return {
    guest_lecture: "Guest Lecture",
    workshop: "Workshop",
    live_project: "Live Project",
    research: "Research Collaboration",
    faculty_training: "Faculty Industry Training",
    consultancy: "Consultancy",
    curriculum_review: "Curriculum Review",
  }[t];
}

export function checkCode(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (h * 33) ^ id.charCodeAt(i);
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

// ── hero personas ─────────────────────────────────────────────────────────

function heroAarav(): Student {
  const ev = (
    skillId: Id,
    selfRating: ProficiencyLevel,
    assessedLevel: ProficiencyLevel | undefined,
    kinds: Array<StudentSkill["evidence"][number]["kind"]>,
  ): StudentSkill => ({
    skillId,
    selfRating,
    assessedLevel,
    evidence: kinds.map((kind) => ({
      kind,
      label: {
        self_declared: "Added by student",
        assessment: "KaushalSetu skill assessment",
        project: "Portfolio project",
        certificate: "NPTEL certificate",
        faculty_verified: "Verified by Prof. Meera Krishnan",
        industry_verified: "Verified by VedaLabs mentor",
      }[kind],
      date: isoDaysAgo(60),
      verifier:
        kind === "faculty_verified"
          ? "Prof. Meera Krishnan"
          : kind === "industry_verified"
            ? "Sridhar Iyer, VedaLabs"
            : undefined,
    })),
  });
  return {
    id: "stu-aarav",
    name: "Aarav Sharma",
    email: "aarav.sharma@coep.example.in",
    institutionId: "inst-coep",
    departmentId: "dept-inst-coep-cse",
    programme: "B.Tech CSE",
    graduationYear: 2026,
    semester: 7,
    cgpa: 8.6,
    city: "Pune",
    photoSeed: "aarav-42",
    headline: "Final-year CSE · targeting Machine Learning Engineer",
    careerInterests: ["role-data-scientist", "role-ml-eng"],
    targetRoleId: "role-ml-eng",
    skills: [
      ev("sk-python-data", 6, 6, [
        "self_declared",
        "assessment",
        "project",
        "faculty_verified",
      ]),
      ev("sk-ml", 6, 7, [
        "self_declared",
        "assessment",
        "project",
        "project",
        "certificate",
        "faculty_verified",
      ]),
      ev("sk-stats", 5, 5, ["self_declared", "assessment"]),
      ev("sk-featureeng", 5, 5, ["self_declared", "assessment", "project"]),
      ev("sk-nlp", 4, 4, ["self_declared", "project"]),
      ev("sk-dl", 4, 4, ["self_declared", "certificate"]),
      ev("sk-sql", 4, 4, ["self_declared", "assessment"]),
      ev("sk-docker", 3, undefined, ["self_declared", "industry_verified"]),
      ev("sk-api", 3, undefined, ["self_declared", "industry_verified"]),
      ev("sk-mlops", 2, undefined, ["self_declared"]),
      ev("sk-git", 5, undefined, ["self_declared", "project"]),
      ev("sk-cloud", 2, undefined, ["self_declared"]),
    ],
    endorsements: [
      {
        by: "Prof. Meera Krishnan",
        role: "faculty",
        organisation: "COEP",
        competencyId: "cmp-ml-engineering",
        note: "Top of the ML elective; churn project was production-quality.",
        date: isoDaysAgo(70),
      },
    ],
    demo: true,
  };
}

function heroAnanya(): Student {
  const mk = (
    skillId: Id,
    selfRating: ProficiencyLevel,
    assessedLevel: ProficiencyLevel | undefined,
    kinds: Array<StudentSkill["evidence"][number]["kind"]>,
  ): StudentSkill => ({
    skillId,
    selfRating,
    assessedLevel,
    evidence: kinds.map((kind) => ({
      kind,
      label: {
        self_declared: "Added by student",
        assessment: "KaushalSetu skill assessment",
        project: "Portfolio project",
        certificate: "Industry course certificate",
        faculty_verified: "Verified by Dr. Anaya Bose",
        industry_verified: "Verified during HimVeda visit",
      }[kind],
      date: isoDaysAgo(50),
      verifier: kind === "faculty_verified" ? "Dr. Anaya Bose" : undefined,
    })),
  });
  return {
    id: "stu-ananya",
    name: "Dr. Ananya Nair",
    email: "ananya.nair@aiia.example.in",
    institutionId: "inst-aiia",
    departmentId: "dept-inst-aiia-rasashastra",
    programme: "BAMS",
    graduationYear: 2026,
    semester: 8,
    cgpa: 8.1,
    city: "New Delhi",
    photoSeed: "ananya-7",
    headline: "BAMS final year · targeting Ayurvedic Formulation QA Analyst",
    careerInterests: ["role-reg-affairs", "role-formulation-qa"],
    targetRoleId: "role-formulation-qa",
    skills: [
      mk("sk-ayur-pharma", 6, 6, [
        "self_declared",
        "assessment",
        "project",
        "faculty_verified",
      ]),
      mk("sk-dravyaguna", 6, 6, [
        "self_declared",
        "assessment",
        "faculty_verified",
      ]),
      mk("sk-herbal-id", 4, 4, ["self_declared", "project"]),
      mk("sk-gmp", 3, 3, ["self_declared", "assessment", "certificate"]),
      mk("sk-qc-lab", 2, undefined, ["self_declared", "project"]),
      mk("sk-reg-ayush", 3, undefined, ["self_declared", "certificate"]),
      mk("sk-domain-writing", 4, undefined, ["self_declared", "project"]),
      mk("sk-comm", 5, undefined, ["self_declared", "faculty_verified"]),
      mk("sk-lit-review", 4, 4, ["self_declared", "assessment"]),
    ],
    endorsements: [
      {
        by: "Dr. Anaya Bose",
        role: "faculty",
        organisation: "AIIA",
        competencyId: "cmp-ayur-formulation",
        note: "Excellent grasp of Bhaishajya Kalpana; meticulous in the pharmacognosy lab.",
        date: isoDaysAgo(60),
      },
    ],
    demo: true,
  };
}
