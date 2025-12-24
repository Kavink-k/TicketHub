import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut, Ticket, MapPin, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

export function Navbar() {
  const { user, logout } = useAuth();
  const [selectedCity, setSelectedCity] = useState("Mumbai");

  return (
    <nav className="glass-header h-16 flex items-center px-4 md:px-8 border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground font-bold text-xl rounded p-1">
            <Ticket className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight hidden sm:block">
            TicketHub
          </span>
        </Link>

        {/* Search Bar - Hidden on mobile, simplified */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search for movies, events, plays..." 
            className="pl-10 bg-secondary/50 border-transparent focus:bg-background transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Location Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium gap-2 hidden sm:flex h-9">
                <MapPin className="w-4 h-4" />
                {selectedCity}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold">Select City</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CITIES.map((city) => (
                <DropdownMenuItem
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={selectedCity === city ? "bg-primary/10" : ""}
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings" className="cursor-pointer">
                    <Ticket className="mr-2 h-4 w-4" /> My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="px-6 font-semibold">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
