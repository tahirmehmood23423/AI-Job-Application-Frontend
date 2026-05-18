import type { ParsedResume } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://tahir283417-resume-parser.hf.space";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

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

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
