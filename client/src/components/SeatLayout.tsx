import { type Seat } from "@/shared/schema";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface SeatLayoutProps {
  seats: Seat[];
  selectedSeatIds: number[];
  onToggleSeat: (seatId: number) => void;
  maxSelectable?: number;
}

// Category configuration matching data-service.ts
const CATEGORY_CONFIG = [
  { name: "VIP", className: "border-purple-500 text-purple-600 bg-purple-50 hover:bg-purple-100", price: 25 },
  { name: "Premium", className: "border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100", price: 18 },
  { name: "Standard", className: "border-green-500 text-green-600 bg-green-50 hover:bg-green-100", price: 12 },
  { name: "Economy", className: "border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100", price: 10 },
];

export function SeatLayout({ seats, selectedSeatIds, onToggleSeat, maxSelectable }: SeatLayoutProps) {
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);
  
  // Get unique rows from seats
  const getRow = useCallback((seatNum: string) => seatNum.replace(/[0-9]/g, ''), []);
  
  // Group seats by category and then by row
  const getSeatsByCategoryAndRow = useCallback(() => {
    const grouped: Record<string, Record<string, Seat[]>> = {};
    
    seats.forEach(seat => {
      const row = getRow(seat.seatNumber);
      if (!grouped[seat.category]) {
        grouped[seat.category] = {};
      }
      if (!grouped[seat.category][row]) {
        grouped[seat.category][row] = [];
      }
      grouped[seat.category][row].push(seat);
    });
    
    return grouped;
  }, [seats, getRow]);

  // Get category display name and config
  const getCategoryConfig = (category: string) => {
    return CATEGORY_CONFIG.find(c => c.name.toLowerCase() === category.toLowerCase()) || 
      CATEGORY_CONFIG.find(c => c.name === category) || { name: category, className: "", price: 0 };
  };

  // Handle seat click with max selection check
  const handleSeatClick = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    if (isBooked(seat)) return;
    if (isSelected) {
      onToggleSeat(seat.id);
    } else if (!maxSelectable || selectedSeatIds.length < maxSelectable) {
      onToggleSeat(seat.id);
    }
  };

  // Check if seat is booked
  const isBooked = (seat: Seat) => seat.status === 'booked';

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, seat: Seat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSeatClick(seat);
    }
  };

  // Render a single seat
  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    const booked = isBooked(seat);
    const categoryConfig = getCategoryConfig(seat.category);
    
    return (
      <button
        key={seat.id}
        onClick={() => handleSeatClick(seat)}
        onKeyDown={(e) => handleKeyDown(e, seat)}
        onMouseEnter={() => setHoveredSeat(seat.id)}
        onMouseLeave={() => setHoveredSeat(null)}
        disabled={booked}
        aria-label={`Seat ${seat.seatNumber}, ${seat.category}, ₹${seat.price}, ${booked ? 'sold' : isSelected ? 'selected' : 'available'}`}
        aria-pressed={isSelected}
        className={cn(
          "relative w-8 h-8 md:w-10 md:h-10 rounded-t-lg text-[10px] md:text-xs font-medium border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          booked 
            ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed" 
            : isSelected
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105 z-10 ring-2 ring-primary ring-offset-1"
              : categoryConfig.className,
          !booked && !isSelected && "hover:scale-105 hover:shadow-md cursor-pointer",
          booked && "opacity-50"
        )}
      >
        <span className="relative z-10">{seat.seatNumber}</span>
        
        {/* Hover tooltip */}
        {!booked && hoveredSeat === seat.id && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in duration-150">
            {seat.category} - ₹{seat.price}
          </div>
        )}
      </button>
    );
  };

  const groupedSeats = getSeatsByCategoryAndRow();

  return (
    <div className="w-full flex flex-col items-center gap-6 py-6 overflow-x-auto">
      {/* Screen */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-2 mb-4">
        <div className="w-[90%] h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent shadow-[0_2px_15px_rgba(248,68,100,0.4)] rounded-full" />
        <div className="w-[70%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Screen this way</span>
      </div>

      {/* Seats Layout */}
      <div className="flex flex-col gap-6 min-w-[320px]">
        {Object.entries(groupedSeats).map(([category, rows]) => {
          const categoryConfig = getCategoryConfig(category);
          const categorySeats = Object.values(rows).flat();
          if (categorySeats.length === 0) return null;

          return (
            <div key={category} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span className={cn("w-2 h-2 rounded-full", 
                  categoryConfig.name === "VIP" && "bg-purple-500",
                  categoryConfig.name === "Premium" && "bg-yellow-500",
                  categoryConfig.name === "Standard" && "bg-green-500",
                  categoryConfig.name === "Economy" && "bg-blue-500"
                )} />
                {categoryConfig.name}
                <span className="text-muted-foreground/60">-</span>
                <span>₹{categoryConfig.price}</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                {Object.entries(rows)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([row, rowSeats]) => (
                    <div key={row} className="flex gap-2 justify-center items-center">
                      <div className="w-5 text-xs text-muted-foreground font-mono font-medium">{row}</div>
                      <div className="flex gap-1.5 md:gap-2">
                        {rowSeats
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

      {/* Enhanced Legend */}
      <div className="flex flex-wrap gap-6 mt-6 justify-center px-4">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-5 h-5 rounded-t-lg border-2 border-green-500 bg-green-50 flex items-center justify-center text-[8px] font-medium text-green-600"
          )}>A1</div>
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-5 h-5 rounded-t-lg bg-primary border-2 border-primary flex items-center justify-center text-[8px] font-medium text-primary-foreground"
          )}>A1</div>
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-t-lg bg-muted border-transparent flex items-center justify-center text-[8px] font-medium text-muted-foreground opacity-50">A1</div>
          <span className="text-xs text-muted-foreground">Sold</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-xs text-muted-foreground">VIP - ₹25</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-muted-foreground">Premium - ₹18</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Standard - ₹12</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs text-muted-foreground">Economy - ₹10</span>
        </div>
      </div>
    </div>
  );
}
