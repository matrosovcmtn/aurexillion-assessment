export const assigneeQueryKeys = {
  all: ["assignees"] as const,
  lists: () => [...assigneeQueryKeys.all, "list"] as const,
  list: () => [...assigneeQueryKeys.lists()] as const,
};
