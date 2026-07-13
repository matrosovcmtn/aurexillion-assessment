import { httpDelete, httpGet, httpPost, httpPut } from "@/shared/api";

import type { Tag, TagInput } from "../model/types";

export function getTags(signal?: AbortSignal): Promise<Tag[]> {
  return httpGet<Tag[]>("/api/tags", signal);
}

export function createTag(input: TagInput, signal?: AbortSignal): Promise<Tag> {
  return httpPost<Tag>("/api/tags", input, signal);
}

export function updateTag(id: number, input: TagInput, signal?: AbortSignal): Promise<Tag> {
  return httpPut<Tag>(`/api/tags/${id}`, input, signal);
}

export function deleteTag(id: number, signal?: AbortSignal): Promise<void> {
  return httpDelete(`/api/tags/${id}`, signal);
}
