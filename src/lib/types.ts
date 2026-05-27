// Mirrors the FastAPI service's schemas exactly.
// If the backend schema changes, update here too.

// ---------- Module 1: ParsedResume ----------

export interface PersonalInfo {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
}

export interface Skills {
  technical: string[];
  soft: string[];
  tools: string[];
  languages: string[];
}

export interface ExperienceEntry {
  company: string;
  title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  responsibilities: string[];
  technologies: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  achievements: string[];
}

export interface ProjectEntry {
  name: string;
  description: string | null;
  technologies: string[];
  url: string | null;
  role: string | null;
}

export interface CertificationEntry {
  name: string;
  issuer: string | null;
  date_obtained: string | null;
  credential_url: string | null;
}

export interface ParsedResume {
  request_id: string;
  parsed_at: string;
  personal: PersonalInfo;
  summary: string | null;
  skills: Skills;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  raw_text_length: number;
  extraction_warnings: string[];
}

// ---------- Module 2: Match types ----------

export type RequirementType = "skill" | "experience" | "education" | "certification" | "other";
export type RequirementImportance = "required" | "preferred" | "nice_to_have";
export type RequirementMatchStatus = "match" | "partial" | "missing";

export interface MatchedRequirement {
  text: string;
  type: RequirementType;
  importance: RequirementImportance;
  status: RequirementMatchStatus;
  evidence: string | null;
}

export interface MatchRequest {
  resume: ParsedResume;
  job_description: string;
  job_title?: string | null;
  company?: string | null;
}

export interface MatchResult {
  request_id: string;
  matched_at: string;
  overall_score: number;
  verdict: "strong" | "moderate" | "weak";
  semantic_similarity: number;
  requirement_coverage: number;
  matched_requirements: MatchedRequirement[];
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
  job_title: string | null;
  company: string | null;
}

// ---------- Module 3: Tailor types ----------

export type TailorMode = "strict" | "auto";

export type ChangeType =
  | "summary_rewritten"
  | "skill_reordered"
  | "skill_emphasised"
  | "experience_bullet_rewritten"
  | "experience_bullets_reordered"
  | "project_description_rewritten"
  | "projects_reordered";

export type ChangeImpact = "high" | "medium" | "low";

export interface Change {
  id: string;
  type: ChangeType;
  impact: ChangeImpact;
  section: string;
  rationale: string;
  before: string | null;
  after: string | null;
  before_list: string[] | null;
  after_list: string[] | null;
}

export type ATSSeverity = "error" | "warning" | "info";

export interface ATSIssue {
  severity: ATSSeverity;
  rule: string;
  message: string;
  where: string | null;
}

export interface ATSReport {
  score: number;
  issues: ATSIssue[];
  keyword_coverage: number;
  keyword_matches: string[];
  keyword_misses: string[];
}

export interface TailorRequest {
  resume: ParsedResume;
  job_description: string;
  job_title?: string | null;
  company?: string | null;
  mode: TailorMode;
}

export interface TailorResult {
  request_id: string;
  tailored_at: string;
  mode: TailorMode;
  original: ParsedResume;
  tailored: ParsedResume;
  changes: Change[];
  ats_report: ATSReport;
  job_title: string | null;
  company: string | null;
  total_changes: number;
  high_impact_changes: number;
}

// ---------- Module 4: Cover Letter types ----------

export type TonePreference = "professional" | "conversational" | "confident" | "enthusiastic";

export interface TalkingPoints {
  strongest_experiences: string[];
  matched_skills: string[];
  standout_achievement: string;
  why_this_company: string;
  gap_to_address: string | null;
}

export interface CoverLetterRequest {
  resume: ParsedResume;
  match_result?: MatchResult | null;
  job_description: string;
  tone: TonePreference;
  job_title?: string | null;
  company_name?: string | null;
}

export interface CoverLetterResult {
  cover_letter: string;
  talking_points: TalkingPoints;
  word_count: number;
  tone_applied: TonePreference;
  match_score_used: number | null;
}

// ---------- Module 5: Job Discovery types ----------

export type JobSource = "linkedin" | "indeed" | "remotive";

export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "remote"
  | "internship"
  | "unknown";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  job_type: JobType;
  description_snippet: string;
  url: string;
  posted_at: string | null;
  source: JobSource;
  match_score: number | null;
  match_verdict: string | null;
}

export interface JobSearchRequest {
  resume: ParsedResume;
  keywords?: string[] | null;
  location?: string | null;
  sources?: JobSource[];
  max_results_per_source?: number;
  auto_match?: boolean;
}

export interface JobSearchResult {
  jobs: JobListing[];
  total_found: number;
  keywords_used: string[];
  location_used: string | null;
  sources_queried: JobSource[];
  auto_matched: boolean;
}

export type SavedJobStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "rejected"
  | "offer";

export interface SavedJob {
  job: JobListing;
  saved_at: string;
  notes: string | null;
  status: SavedJobStatus;
}
// ── Module 6 — Dashboard ──────────────────────────────────────────
export type ApplicationStatus =
  | "saved" | "applied" | "screening"
  | "interview" | "offer" | "rejected" | "withdrawn";

export interface StatusEvent {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  resume_id: string;
  job_title: string;
  company: string;
  job_url: string | null;
  location: string | null;
  salary_range: string | null;
  match_score: number | null;
  ats_score: number | null;
  status: ApplicationStatus;
  notes: string | null;
  cover_letter: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
  events: StatusEvent[];
}

export interface DashboardStats {
  total_applications: number;
  avg_match_score: number | null;
  avg_ats_score: number | null;
  status_breakdown: { status: ApplicationStatus; count: number }[];
  top_companies: string[];
  applications_this_week: number;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved", applied: "Applied", screening: "Screening",
  interview: "Interview", offer: "Offer",
  rejected: "Rejected", withdrawn: "Withdrawn",
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: "bg-gray-100 text-gray-700",
  applied: "bg-blue-100 text-blue-700",
  screening: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-500",
};

export const STATUS_ORDER: ApplicationStatus[] = [
  "saved", "applied", "screening", "interview", "offer", "rejected", "withdrawn",
];