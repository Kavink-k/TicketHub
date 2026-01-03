import { useQuery } from "@tanstack/react-query";
import { getShowsForMovie, getShow, getSeatsForShow } from "@/lib/data-service";

export function useShows(movieId: number, theatreId?: number) {
  return useQuery({
    queryKey: ["shows", movieId, theatreId],
    queryFn: () => {
      return getShowsForMovie(movieId, theatreId);
    },
    enabled: !!movieId,
  });
}

export function useShow(id: number) {
  return useQuery({
    queryKey: ["show", id],
    queryFn: () => {
      return getShow(id);
    },
    enabled: !!id,
  });
}

export function useSeats(showId: number) {
  return useQuery({
    queryKey: ["seats", showId],
    queryFn: () => {
      return getSeatsForShow(showId);
    },
    enabled: !!showId,
    refetchInterval: 5000, // Poll every 5s for seat updates
  });
}
