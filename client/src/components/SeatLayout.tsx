import { type Seat } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SeatLayoutProps {
  seats: Seat[];
  selectedSeatIds: number[];
  onToggleSeat: (seatId: number) => void;
  maxSelectable?: number;
}

export function SeatLayout({ seats, selectedSeatIds, onToggleSeat }: SeatLayoutProps) {
  // Group seats by category
  const categories = ["VIP", "Premium", "Normal"];
  
  // Find unique rows (assuming seatNumber is like "A1", "A2", "B1"...)
  const getRow = (seatNum: string) => seatNum.replace(/[0-9]/g, '');
  
  // Helper to render a seat
  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    const isBooked = seat.status === 'booked';
    
    return (
      <button
        key={seat.id}
        onClick={() => !isBooked && onToggleSeat(seat.id)}
        disabled={isBooked}
        className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-t-lg text-[10px] md:text-xs font-medium border flex items-center justify-center transition-all duration-200",
          isBooked 
            ? "bg-muted text-muted-foreground cursor-not-allowed border-transparent" 
            : isSelected
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-110 z-10"
              : "bg-background border-green-500 text-green-600 hover:bg-green-50"
        )}
      >
        {seat.seatNumber}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 py-8 overflow-x-auto">
      {/* Screen */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-2 mb-8">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_4px_20px_rgba(248,68,100,0.3)]" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Screen this way</span>
      </div>

      <div className="flex flex-col gap-8 min-w-[320px]">
        {categories.map((category) => {
          const categorySeats = seats.filter(s => s.category === category);
          if (categorySeats.length === 0) return null;

          // Group by rows
          const rows = Array.from(new Set(categorySeats.map(s => getRow(s.seatNumber)))).sort();

          return (
            <div key={category} className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                {category} - ₹{categorySeats[0]?.price}
              </div>
              <div className="flex flex-col gap-2">
                {rows.map(row => (
                  <div key={row} className="flex gap-2 justify-center items-center">
                    <div className="w-4 text-xs text-muted-foreground font-mono">{row}</div>
                    <div className="flex gap-2 md:gap-3">
                      {categorySeats
                        .filter(s => getRow(s.seatNumber) === row)
                        .sort((a, b) => {
                          const numA = parseInt(a.seatNumber.replace(/\D/g, ''));
                          const numB = parseInt(b.seatNumber.replace(/\D/g, ''));
                          return numA - numB;
                        })
                        .map(renderSeat)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-green-500 bg-white" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">Sold</span>
        </div>
      </div>
    </div>
  );
}
