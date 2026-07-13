import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createStatus, deleteStatus, getStatuses, updateStatus } from "./status-api";
import { statusQueryKeys } from "./status-query-keys";
import type { StatusInput } from "../model/types";

export function useStatusesQuery(active?: boolean) {
  return useQuery({
    queryKey: statusQueryKeys.list(active),
    queryFn: ({ signal }) => getStatuses(active, signal),
  });
}

export function useCreateStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StatusInput) => createStatus(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: statusQueryKeys.lists() });
    },
  });
}

export function useUpdateStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: StatusInput }) => updateStatus(id, input),
    onSuccess: async (status) => {
      queryClient.setQueryData(statusQueryKeys.detail(status.id), status);
      await queryClient.invalidateQueries({ queryKey: statusQueryKeys.lists() });
    },
  });
}

export function useDeleteStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteStatus(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: statusQueryKeys.lists() });
    },
  });
}
