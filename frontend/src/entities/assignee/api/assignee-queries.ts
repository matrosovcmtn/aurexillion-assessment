import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAssignee, deleteAssignee, getAssignees, updateAssignee } from "./assignee-api";
import { assigneeQueryKeys } from "./assignee-query-keys";
import type { AssigneeInput } from "../model/types";

export function useAssigneesQuery() {
  return useQuery({
    queryKey: assigneeQueryKeys.list(),
    queryFn: ({ signal }) => getAssignees(signal),
  });
}

export function useCreateAssigneeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssigneeInput) => createAssignee(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: assigneeQueryKeys.lists() });
    },
  });
}

export function useUpdateAssigneeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AssigneeInput }) => updateAssignee(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: assigneeQueryKeys.lists() });
    },
  });
}

export function useDeleteAssigneeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAssignee(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: assigneeQueryKeys.lists() });
    },
  });
}
