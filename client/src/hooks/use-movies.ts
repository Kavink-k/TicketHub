import { useQuery } from "@tanstack/react-query";
import { getMovies, getMovie } from "@/lib/data-service";

export function useMovies() {
  return useQuery({
    queryKey: ["movies"],
    queryFn: () => {
      return getMovies();
    },
  });
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: () => {
      return getMovie(id);
    },
    enabled: !!id,
  });
}
