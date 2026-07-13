import { httpDelete, httpGet, httpPost, httpPut } from "@/shared/api";

import type { Assignee, AssigneeInput } from "../model/types";

export function getAssignees(signal?: AbortSignal): Promise<Assignee[]> {
  return httpGet<Assignee[]>("/api/assignees", signal);
}

export function createAssignee(input: AssigneeInput, signal?: AbortSignal): Promise<Assignee> {
  return httpPost<Assignee>("/api/assignees", input, signal);
}

export function updateAssignee(
  id: number,
  input: AssigneeInput,
  signal?: AbortSignal,
): Promise<Assignee> {
  return httpPut<Assignee>(`/api/assignees/${id}`, input, signal);
}

export function deleteAssignee(id: number, signal?: AbortSignal): Promise<void> {
  return httpDelete(`/api/assignees/${id}`, signal);
}
