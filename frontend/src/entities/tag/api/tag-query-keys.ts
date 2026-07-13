export const tagQueryKeys = {
  all: ["tags"] as const,
  lists: () => [...tagQueryKeys.all, "list"] as const,
  list: () => [...tagQueryKeys.lists()] as const,
};
