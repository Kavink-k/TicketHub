import { useQuery } from "@tanstack/react-query";
import { getSnacks } from "@/lib/data-service";

export function useSnacks() {
  return useQuery({
    queryKey: ["snacks"],
    queryFn: () => {
      return getSnacks();
    },
  });
}
