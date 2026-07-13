import { httpDelete, httpGet, httpPost, httpPut } from "@/shared/api";

import type { Status, StatusInput } from "../model/types";

export function getStatuses(active?: boolean, signal?: AbortSignal): Promise<Status[]> {
  const params = new URLSearchParams();
  if (active !== undefined) {
    params.set("active", String(active));
  }
  const query = params.toString();
  return httpGet<Status[]>(query ? `/api/statuses?${query}` : "/api/statuses", signal);
}

export function getStatusById(id: number, signal?: AbortSignal): Promise<Status> {
  return httpGet<Status>(`/api/statuses/${id}`, signal);
}

export function createStatus(input: StatusInput, signal?: AbortSignal): Promise<Status> {
  return httpPost<Status>("/api/statuses", input, signal);
}

export function updateStatus(
  id: number,
  input: StatusInput,
  signal?: AbortSignal,
): Promise<Status> {
  return httpPut<Status>(`/api/statuses/${id}`, input, signal);
}

export function deleteStatus(id: number, signal?: AbortSignal): Promise<void> {
  return httpDelete(`/api/statuses/${id}`, signal);
}
