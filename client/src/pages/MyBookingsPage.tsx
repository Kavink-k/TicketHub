import { useMyBookings } from "@/hooks/use-bookings";
import { Navbar } from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function MyBookingsPage() {
  const { data: bookings, isLoading } = useMyBookings();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">My Bookings</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-dashed">
            <p className="text-muted-foreground">No bookings yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings?.map(booking => (
              <div key={booking.id} className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-32">
                  <div className="w-24 shrink-0 bg-muted">
                    <img 
                      src={booking.movie.posterUrl} 
                      className="w-full h-full object-cover" 
                      alt="poster" 
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold line-clamp-1">{booking.movie.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(booking.show.showTime), "EEE, d MMM • h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'} className={booking.paymentStatus === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {booking.paymentStatus}
                      </Badge>
                      <span className="font-bold">₹{booking.totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
