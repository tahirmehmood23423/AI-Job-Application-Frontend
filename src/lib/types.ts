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

export type RequirementType =
  | "skill"
  | "experience"
  | "education"
  | "certification"
  | "other";

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
  overall_score: number; // 0–100
  verdict: "strong" | "moderate" | "weak";
  semantic_similarity: number; // 0–1
  requirement_coverage: number; // 0–1
  matched_requirements: MatchedRequirement[];
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
  job_title: string | null;
  company: string | null;
}
