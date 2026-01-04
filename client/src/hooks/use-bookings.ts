import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBooking, getUserBookings, getBookingById, getCurrentUser, getSeatsForShow, getSnacks as getSnacksData } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";

type CreateBookingInput = {
  showId: number;
  seatIds: number[];
  snacks?: { snackId: number; quantity: number; }[];
};

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBookingInput) => {
      const user = getCurrentUser();
      if (!user) {
        throw new Error("You must be logged in to create a booking");
      }

      // Get actual seat prices from the data service
      const seats = getSeatsForShow(data.showId);
      const seatTotal = data.seatIds.reduce((sum, seatId) => {
        const seat = seats.find(s => s.id === seatId);
        return sum + (seat?.price || 12);
      }, 0);

      // Get actual snack prices
      const snacksData = getSnacksData();
      const snackTotal = (data.snacks || []).reduce((sum, snack) => {
        const snackData = snacksData.find(s => s.id === snack.snackId);
        return sum + (snackData?.price || 0) * snack.quantity;
      }, 0);

      const totalPrice = seatTotal + snackTotal;

      return createBooking({
        userId: user.id,
        showId: data.showId,
        seatIds: data.seatIds,
        snacks: data.snacks,
        totalPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Booking Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => {
      const user = getCurrentUser();
      if (!user) return [];
      return getUserBookings(user.id);
    },
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => {
      return getBookingById(id);
    },
    enabled: !!id,
  });
}
