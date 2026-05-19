import type { MatchRequest, MatchResult, ParsedResume } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://tahir283417-resume-parser.hf.space";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------- Module 1: parse résumé ----------

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
      /* ignore JSON parse errors */
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as ParsedResume;
}

// ---------- Module 2: match résumé to a job ----------

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

// ---------- Health ----------

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
