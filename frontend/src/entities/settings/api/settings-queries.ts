import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSettings, updateSettings } from "./settings-api";
import { settingsQueryKeys } from "./settings-query-keys";
import type { AppSettingsInput } from "../model/types";

export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsQueryKeys.detail(),
    queryFn: ({ signal }) => getSettings(signal),
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AppSettingsInput) => updateSettings(input),
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsQueryKeys.detail(), settings);
    },
  });
}
