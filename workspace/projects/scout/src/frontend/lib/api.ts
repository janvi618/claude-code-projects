/**
 * Typed fetch wrapper for the SCOUT backend API.
 * All API calls go through these functions.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  sessionToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {}
    throw new APIError(res.status, detail);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ─── Intelligence Items ──────────────────────────────────────────────────────

export interface IntelligenceItem {
  id: string;
  headline: string;
  summary: string | null;
  companies: string[];
  brands: string[];
  categories: string[];
  domain: string;
  claims: string[];
  sentiment: string | null;
  strategic_relevance: string | null;
  relevance_score: number;
  source_url: string | null;
  source_name: string | null;
  published_at: string | null;
  processed_at: string;
  alerted: boolean;
}

export interface ItemListResponse {
  items: IntelligenceItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ItemFilters {
  companies?: string;
  domains?: string;
  min_score?: number;
  after?: string;
  before?: string;
  limit?: number;
  offset?: number;
}

export async function getItems(
  filters: ItemFilters = {},
  token?: string
): Promise<ItemListResponse> {
  const params = new URLSearchParams();
  if (filters.companies) params.set("companies", filters.companies);
  if (filters.domains) params.set("domains", filters.domains);
  if (filters.min_score !== undefined) params.set("min_score", String(filters.min_score));
  if (filters.after) params.set("after", filters.after);
  if (filters.before) params.set("before", filters.before);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));

  const qs = params.toString();
  return apiFetch<ItemListResponse>(
    `/api/items${qs ? `?${qs}` : ""}`,
    {},
    token
  );
}

export async function getItem(id: string, token?: string): Promise<IntelligenceItem> {
  return apiFetch<IntelligenceItem>(`/api/items/${id}`, {}, token);
}

export async function searchItems(
  q: string,
  token?: string
): Promise<Array<IntelligenceItem & { similarity: number }>> {
  const params = new URLSearchParams({ q });
  return apiFetch(`/api/items/search?${params}`, {}, token);
}

// ─── Briefs ─────────────────────────────────────────────────────────────────

export interface DailyBrief {
  id: string;
  brief_date: string;
  content_html: string;
  content_text: string | null;
  item_ids: string[];
  word_count: number | null;
  generated_at: string;
  delivered_at: string | null;
  model_used: string | null;
  token_count_input: number | null;
  token_count_output: number | null;
}

export interface BriefSummary {
  id: string;
  brief_date: string;
  word_count: number | null;
  generated_at: string;
  delivered_at: string | null;
}

export async function getBriefs(token?: string): Promise<BriefSummary[]> {
  return apiFetch<BriefSummary[]>("/api/briefs", {}, token);
}

export async function getLatestBrief(token?: string): Promise<DailyBrief> {
  return apiFetch<DailyBrief>("/api/briefs/latest", {}, token);
}

export async function getBriefByDate(
  date: string,
  token?: string
): Promise<DailyBrief> {
  return apiFetch<DailyBrief>(`/api/briefs/${date}`, {}, token);
}

export async function generateBrief(token?: string): Promise<{ status: string; date: string }> {
  return apiFetch("/api/briefs/generate", { method: "POST" }, token);
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SourceCitation {
  title: string;
  url: string | null;
  published_at: string | null;
  similarity: number | null;
}

export interface ChatResponse {
  response: string;
  sources: SourceCitation[];
  suggestions: string[];
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  token?: string
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(
    "/api/chat",
    {
      method: "POST",
      body: JSON.stringify({ message, history }),
    },
    token
  );
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  name: string;
  source_type: string;
  url: string;
  cadence_minutes: number;
  competitor_id: string | null;
  enabled: boolean;
  healthy: boolean;
  consecutive_failures: number;
  last_collected_at: string | null;
  config_json: Record<string, unknown>;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  receive_brief: boolean;
  last_login_at: string | null;
  created_at: string;
}

export async function getAdminSources(token?: string): Promise<Source[]> {
  return apiFetch<Source[]>("/api/admin/sources", {}, token);
}

export async function createSource(
  data: Partial<Source>,
  token?: string
): Promise<Source> {
  return apiFetch<Source>(
    "/api/admin/sources",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export async function updateSource(
  id: string,
  data: Partial<Source>,
  token?: string
): Promise<Source> {
  return apiFetch<Source>(
    `/api/admin/sources/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    token
  );
}

export async function testSource(id: string, token?: string): Promise<{ status: string }> {
  return apiFetch(
    `/api/admin/sources/${id}/test`,
    { method: "POST" },
    token
  );
}

export async function getAdminUsers(token?: string): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/api/admin/users", {}, token);
}

export async function inviteUser(
  email: string,
  role: string,
  token?: string
): Promise<{ status: string; user_id: string }> {
  return apiFetch(
    "/api/admin/users/invite",
    { method: "POST", body: JSON.stringify({ email, role }) },
    token
  );
}

export async function updateUser(
  id: string,
  data: { role?: string; receive_brief?: boolean },
  token?: string
): Promise<AdminUser> {
  return apiFetch(
    `/api/admin/users/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    token
  );
}

export async function getSystemHealth(token?: string): Promise<Record<string, unknown>> {
  return apiFetch("/api/admin/health", {}, token);
}
