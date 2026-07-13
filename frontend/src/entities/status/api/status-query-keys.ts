export const statusQueryKeys = {
  all: ["statuses"] as const,
  lists: () => [...statusQueryKeys.all, "list"] as const,
  list: (active?: boolean) => [...statusQueryKeys.lists(), { active }] as const,
  details: () => [...statusQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...statusQueryKeys.details(), id] as const,
};
