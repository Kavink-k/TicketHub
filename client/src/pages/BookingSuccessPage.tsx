import { useRoute } from "wouter";
import { useBooking } from "@/hooks/use-bookings";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function BookingSuccessPage() {
  const [, params] = useRoute("/bookings/:id");
  const bookingId = parseInt(params?.id || "0");      
  const { data: booking, isLoading } = useBooking(bookingId);

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your tickets have been sent to your email.</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
          {/* Movie Poster Header */}
          <div className="h-32 bg-slate-900 relative overflow-hidden">
             <img 
               src={booking.show.movie.posterUrl} 
               className="w-full h-full object-cover opacity-50 blur-sm"
               alt="poster"
             />
             <div className="absolute inset-0 flex items-center px-6">
               <h2 className="text-xl font-bold text-white drop-shadow-md">{booking.show.movie.title}</h2>
             </div>
          </div>

          <div className="p-6 space-y-6 bg-card relative">
            {/* Punch hole visual effect */}
            <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background border border-border" />
            <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border" />
            
            {/* Show Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Date</p>
                <p className="font-semibold mt-1">{format(new Date(booking.show.showTime), "EEE, d MMM yyyy")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Time</p>
                <p className="font-semibold mt-1">{format(new Date(booking.show.showTime), "h:mm a")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Screen</p>
                <p className="font-semibold mt-1">Hall 1</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Booking ID</p>
                <p className="font-mono font-semibold mt-1 text-primary">#{booking.id}</p>
              </div>
            </div>

            <div className="border-t border-dashed my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Total Amount</p>
                <p className="text-2xl font-bold mt-1">₹{booking.totalPrice}</p>
              </div>
              <div className="bg-white p-2 rounded-lg border">
                <QRCodeSVG value={`BOOKING-${booking.id}`} size={80} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Button className="flex-1" variant="outline">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button className="flex-1" variant="outline">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}
