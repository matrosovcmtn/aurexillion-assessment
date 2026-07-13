import { httpGet, httpPut } from "@/shared/api";

import type { AppSettings, AppSettingsInput } from "../model/types";

export function getSettings(signal?: AbortSignal): Promise<AppSettings> {
  return httpGet<AppSettings>("/api/settings", signal);
}

export function updateSettings(
  input: AppSettingsInput,
  signal?: AbortSignal,
): Promise<AppSettings> {
  return httpPut<AppSettings>("/api/settings", input, signal);
}
