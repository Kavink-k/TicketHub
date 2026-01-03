import { useRoute, Link, useLocation } from "wouter";
import { useShow, useSeats } from "@/hooks/use-shows";
import { useSnacks } from "@/hooks/use-snacks";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Navbar } from "@/components/Navbar";
import { SeatLayout } from "@/components/SeatLayout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { ArrowLeft, Plus, Minus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function SeatSelectionPage() {
  const [, params] = useRoute("/shows/:id/seats");
  const [, setLocation] = useLocation();
  const showId = parseInt(params?.id || "0");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: show, isLoading: isShowLoading } = useShow(showId);
  const { data: seats, isLoading: isSeatsLoading } = useSeats(showId);
  const { data: snacks } = useSnacks();
  
  const { mutate: createBooking, isPending: isBooking } = useCreateBooking();

  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [selectedSnacks, setSelectedSnacks] = useState<Record<number, number>>({});
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Calculate totals
  const seatTotal = useMemo(() => {
    if (!seats) return 0;
    return selectedSeatIds.reduce((sum, id) => {
      const seat = seats.find(s => s.id === id);
      return sum + (seat?.price || 0);
    }, 0);
  }, [selectedSeatIds, seats]);

  // Calculate price breakdown by category
  const seatBreakdown = useMemo(() => {
    if (!seats) return {};
    const breakdown: Record<string, { count: number; total: number }> = {};
    selectedSeatIds.forEach(id => {
      const seat = seats.find(s => s.id === id);
      if (seat) {
        if (!breakdown[seat.category]) {
          breakdown[seat.category] = { count: 0, total: 0 };
        }
        breakdown[seat.category].count += 1;
        breakdown[seat.category].total += seat.price;
      }
    });
    return breakdown;
  }, [selectedSeatIds, seats]);

  const snackTotal = useMemo(() => {
    if (!snacks) return 0;
    return Object.entries(selectedSnacks).reduce((sum, [id, qty]) => {
      const snack = snacks.find(s => s.id === parseInt(id));
      return sum + (snack?.price || 0) * qty;
    }, 0);
  }, [selectedSnacks, snacks]);

  const grandTotal = seatTotal + snackTotal;

  const handleToggleSeat = (seatId: number) => {
    setSelectedSeatIds(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const updateSnack = (snackId: number, delta: number) => {
    setSelectedSnacks(prev => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [snackId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [snackId]: next };
    });
  };

  const handleBooking = () => {
    if (!user) {
      toast({ title: "Please Login", description: "You need to be logged in to book tickets." });
      setLocation("/auth");
      return;
    }

    createBooking({
      showId,
      seatIds: selectedSeatIds,
      snacks: Object.entries(selectedSnacks).map(([id, qty]) => ({ 
        snackId: parseInt(id), 
        quantity: qty 
      })),
    }, {
      onSuccess: (booking) => {
        setIsPaymentOpen(false);
        setLocation(`/bookings/${booking.id}`);
      }
    });
  };

  if (isShowLoading || isSeatsLoading || !show) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/movies/${show.movieId}`}>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg leading-tight">{show.movie?.title || "Movie"}</h1>
              <p className="text-xs text-muted-foreground">
                {format(new Date(show.showTime), "EEE, d MMM • h:mm a")} • {show.theatre?.name || "Theatre"}
              </p>
            </div>
          </div>
          
          {selectedSeatIds.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-muted-foreground">{selectedSeatIds.length} seat{selectedSeatIds.length > 1 ? 's' : ''} • ₹{seatTotal}</span>
                <span className="text-xs text-primary font-medium">
                  {seats?.filter(s => selectedSeatIds.includes(s.id)).map(s => s.seatNumber).join(", ")}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary text-primary hover:bg-primary/5"
                onClick={() => setIsPaymentOpen(true)}
              >
                {selectedSeatIds.length} Seats Selected
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="border-primary/20 text-muted-foreground">
              Select seats to continue
            </Button>
          )}
        </div>
      </div>

      {/* Seat Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-8 overflow-hidden">
           {seats && (
             <SeatLayout 
               seats={seats} 
               selectedSeatIds={selectedSeatIds} 
               onToggleSeat={handleToggleSeat} 
             />
           )}
        </div>
      </div>

      {/* Floating Footer */}
      {selectedSeatIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="container mx-auto flex items-center justify-between max-w-4xl">
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="text-2xl font-bold font-display text-foreground">₹{grandTotal}</p>
            </div>

            <Sheet open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
              <SheetTrigger asChild>
                <Button size="lg" className="px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                  Proceed to Pay
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Order Summary</SheetTitle>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  {/* Movie Info */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold">{show.movie?.title || "Movie"}</h3>
                      <p className="text-sm text-muted-foreground">Hindi, 2D</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(show.showTime), "EEE, d MMM • h:mm a")}
                      </p>
                    </div>
                  </div>

                  {/* Seat Breakdown with category details */}
                  <div className="space-y-2 border-b pb-4">
                    <div className="flex justify-between text-sm">
                      <span>{selectedSeatIds.length} Ticket{selectedSeatIds.length > 1 ? 's' : ''}</span>
                      <span className="font-medium">₹{seatTotal}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(seatBreakdown).map(([category, { count, total }]) => (
                        <span 
                          key={category}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs"
                        >
                          <span className="text-muted-foreground">{category}:</span>
                          <span className="font-medium">{count} × ₹{Math.round(total / count)}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Seats: {seats?.filter(s => selectedSeatIds.includes(s.id)).map(s => s.seatNumber).join(", ")}
                    </p>
                  </div>

                  {/* Snacks Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                      Grab a bite
                    </h4>
                    <div className="space-y-3">
                      {snacks?.map(snack => (
                        <div key={snack.id} className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{snack.name}</span>
                            <span className="text-xs text-muted-foreground">₹{snack.price}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedSnacks[snack.id] ? (
                              <>
                                <Button size="icon" variant="outline" className="h-6 w-6 rounded-full" onClick={() => updateSnack(snack.id, -1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm w-4 text-center">{selectedSnacks[snack.id]}</span>
                                <Button size="icon" variant="outline" className="h-6 w-6 rounded-full" onClick={() => updateSnack(snack.id, 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => updateSnack(snack.id, 1)}>
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="bg-secondary/50 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold text-xl text-primary">₹{grandTotal}</span>
                  </div>
                </div>

                <SheetFooter>
                  <Button className="w-full bg-primary h-12 text-lg" onClick={handleBooking} disabled={isBooking}>
                    {isBooking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        Pay ₹{grandTotal}
                      </>
                    )}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}
    </div>
  );
}
