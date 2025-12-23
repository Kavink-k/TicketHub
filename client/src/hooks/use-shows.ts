import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useShows(movieId: number, theatreId?: number) {
  return useQuery({
    queryKey: [api.shows.list.path, movieId, theatreId],
    queryFn: async () => {
      const params = new URLSearchParams({ movieId: String(movieId) });
      if (theatreId) params.append("theatreId", String(theatreId));
      
      const res = await fetch(`${api.shows.list.path}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch shows");
      return api.shows.list.responses[200].parse(await res.json());
    },
    enabled: !!movieId,
  });
}

export function useShow(id: number) {
  return useQuery({
    queryKey: [api.shows.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.shows.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch show");
      return api.shows.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSeats(showId: number) {
  return useQuery({
    queryKey: [api.shows.seats.path, showId],
    queryFn: async () => {
      const url = buildUrl(api.shows.seats.path, { id: showId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch seats");
      return api.shows.seats.responses[200].parse(await res.json());
    },
    enabled: !!showId,
    refetchInterval: 5000, // Poll every 5s for seat updates
  });
}
