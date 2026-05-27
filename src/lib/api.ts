import type {
  Application,
  ApplicationStatus,
  CoverLetterRequest,
  CoverLetterResult,
  DashboardStats,
  JobSearchRequest,
  JobSearchResult,
  MatchRequest,
  MatchResult,
  ParsedResume,
  TailorRequest,
  TailorResult,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://tahir283417-resume-parser.hf.space";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------- Module 1 ----------

export async function parseResume(file: File): Promise<ParsedResume> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/parse`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new ApiError(
      "Could not reach the parser. The server may be waking up — please try again in 30 seconds."
    );
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, response.status);
  }
  return (await response.json()) as ParsedResume;
}

// ---------- Module 2 ----------

export async function matchJob(request: MatchRequest): Promise<MatchResult> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch (err) {
    throw new ApiError(
      "Could not reach the matcher. The server may be waking up — please try again in 30 seconds."
    );
  }

  if (!response.ok) {
    let detail = `Match request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, response.status);
  }
  return (await response.json()) as MatchResult;
}

// ---------- Module 3 ----------

export async function tailorResume(request: TailorRequest): Promise<TailorResult> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/tailor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch (err) {
    throw new ApiError(
      "Could not reach the tailorer. The server may be waking up — please try again in 30 seconds."
    );
  }

  if (!response.ok) {
    let detail = `Tailor request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, response.status);
  }
  return (await response.json()) as TailorResult;
}

// ---------- Module 4 ----------

export async function generateCoverLetter(
  request: CoverLetterRequest
): Promise<CoverLetterResult> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch (err) {
    throw new ApiError(
      "Could not reach the cover letter generator. The server may be waking up — please try again in 30 seconds."
    );
  }

  if (!response.ok) {
    let detail = `Cover letter request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, response.status);
  }
  return (await response.json()) as CoverLetterResult;
}

// ---------- Module 5 ----------

export async function discoverJobs(
  request: JobSearchRequest
): Promise<JobSearchResult> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/jobs/discover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch (err) {
    throw new ApiError(
      "Could not reach the job discovery service. The server may be waking up — please try again in 30 seconds."
    );
  }

  if (!response.ok) {
    let detail = `Job discovery failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, response.status);
  }
  return (await response.json()) as JobSearchResult;
}

// ---------- Health ----------

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
// ---------- Module 6 ----------

export const listApplications = (
  userId: string,
  params: { status?: ApplicationStatus; search?: string } = {}
): Promise<Application[]> => {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  const q = qs.toString() ? `?${qs}` : "";
  return fetch(`${API_URL}/dashboard/users/${userId}/applications${q}`)
    .then(r => r.json());
};

export const updateApplication = (
  userId: string, appId: string,
  data: { status?: ApplicationStatus; notes?: string }
): Promise<Application> =>
  fetch(`${API_URL}/dashboard/users/${userId}/applications/${appId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const deleteApplication = (userId: string, appId: string): Promise<void> =>
  fetch(`${API_URL}/dashboard/users/${userId}/applications/${appId}`,
    { method: "DELETE" }).then(() => undefined);

export const getDashboardStats = (userId: string): Promise<DashboardStats> =>
  fetch(`${API_URL}/dashboard/users/${userId}/stats`).then(r => r.json());