export const settingsQueryKeys = {
  all: ["settings"] as const,
  detail: () => [...settingsQueryKeys.all, "detail"] as const,
};
