import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSnacks() {
  return useQuery({
    queryKey: [api.snacks.list.path],
    queryFn: async () => {
      const res = await fetch(api.snacks.list.path);
      if (!res.ok) throw new Error("Failed to fetch snacks");
      return api.snacks.list.responses[200].parse(await res.json());
    },
  });
}
