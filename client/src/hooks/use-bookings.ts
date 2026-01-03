import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBooking, getUserBookings, getBookingById, getCurrentUser } from "@/lib/data-service";
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
      
      const snacksWithPrices = data.snacks?.map(s => ({
        ...s,
        price: s.quantity * 12 // Simplified price calculation
      })) || [];
      
      const totalPrice = snacksWithPrices.reduce((sum, s) => sum + s.price, 0) + 
        data.seatIds.length * 12; // Simplified seat price
      
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
