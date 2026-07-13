import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTag, deleteTag, getTags, updateTag } from "./tag-api";
import { tagQueryKeys } from "./tag-query-keys";
import type { TagInput } from "../model/types";

export function useTagsQuery() {
  return useQuery({
    queryKey: tagQueryKeys.list(),
    queryFn: ({ signal }) => getTags(signal),
  });
}

export function useCreateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TagInput) => createTag(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists() });
    },
  });
}

export function useUpdateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TagInput }) => updateTag(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists() });
    },
  });
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists() });
    },
  });
}
