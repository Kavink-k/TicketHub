import type { Movie, Theatre, Show, Seat, Booking, Snack } from "@shared/schema";

// Static data imports
import moviesData from "../../public/data/movies.json";
import theatresData from "../../public/data/theatres.json";
import showsData from "../../public/data/shows.json";
import snacksData from "../../public/data/snacks.json";

// Type assertions for JSON imports
const movies = moviesData as Movie[];
const theatres = theatresData as Theatre[];
const shows = showsData as Show[];
const snacks = snacksData as Snack[];

// Local storage keys
const BOOKINGS_KEY = 'tickethub_bookings';
const SEATS_KEY = 'tickethub_seats';

// Initialize seats for each show
function initializeSeats(): Record<number, Seat[]> {
  const stored = localStorage.getItem(SEATS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const seatsByShow: Record<number, Seat[]> = {};
  
  shows.forEach(show => {
    const seats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;
    
    rows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        let category = 'standard';
        let price = 12;
        
        if (rowIndex < 2) {
          category = 'premium';
          price = 18;
        } else if (rowIndex >= 6) {
          category = 'economy';
          price = 10;
        }
        
        // VIP seats in middle
        if (seatNum >= 5 && seatNum <= 8) {
          category = 'vip';
          price = 25;
        }
        
        seats.push({
          id: show.id * 1000 + rowIndex * 100 + seatNum,
          showId: show.id,
          seatNumber: `${row}${seatNum}`,
          category,
          price,
          status: 'available' as const,
        });
      }
    });
    
    seatsByShow[show.id] = seats;
  });
  
  localStorage.setItem(SEATS_KEY, JSON.stringify(seatsByShow));
  return seatsByShow;
}

// Get seats for a show
export function getSeatsForShow(showId: number): Seat[] {
  const seatsByShow = initializeSeats();
  return seatsByShow[showId] || [];
}

// Update seat status
export function updateSeatStatus(showId: number, seatId: number, status: 'available' | 'booked' | 'selected'): Seat | null {
  const seatsByShow = initializeSeats();
  const seats = seatsByShow[showId];
  
  if (!seats) return null;
  
  const seatIndex = seats.findIndex(s => s.id === seatId);
  if (seatIndex === -1) return null;
  
  seats[seatIndex] = { ...seats[seatIndex], status };
  localStorage.setItem(SEATS_KEY, JSON.stringify(seatsByShow));
  
  return seats[seatIndex];
}

// Get all movies
export function getMovies(): Movie[] {
  return movies;
}

// Get movie by ID
export function getMovie(id: number): Movie | null {
  return movies.find(m => m.id === id) || null;
}

// Get all theatres
export function getTheatres(): Theatre[] {
  return theatres;
}

// Get theatre by ID
export function getTheatre(id: number): Theatre | null {
  return theatres.find(t => t.id === id) || null;
}

// Get shows for a movie
export function getShowsForMovie(movieId: number, theatreId?: number): (Show & { theatre: Theatre; movie?: Movie })[] {
  return shows
    .filter(s => s.movieId === movieId && (!theatreId || s.theatreId === theatreId))
    .map(s => {
      const theatre = getTheatre(s.theatreId);
      const movie = getMovie(s.movieId);
      return {
        ...s,
        theatre: theatre!,
        movie: movie || undefined
      };
    });
}

// Get show by ID
export function getShow(id: number): (Show & { theatre: Theatre; movie?: Movie }) | null {
  const show = shows.find(s => s.id === id);
  if (!show) return null;
  
  const theatre = getTheatre(show.theatreId);
  const movie = getMovie(show.movieId);
  
  return { 
    ...show, 
    theatre: theatre!,
    movie: movie || undefined
  };
}

// Get all snacks
export function getSnacks(): Snack[] {
  return snacks;
}

// Get snack by ID
export function getSnack(id: number): Snack | null {
  return snacks.find(s => s.id === id) || null;
}

// Booking management
function getBookings(): Booking[] {
  const stored = localStorage.getItem(BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveBookings(bookings: Booking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// Create a new booking
export function createBooking(data: {
  userId: number;
  showId: number;
  seatIds: number[];
  snacks?: { snackId: number; quantity: number }[];
  totalPrice: number;
}): Booking {
  const bookings = getBookings();
  
  const newBooking: Booking = {
    id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
    userId: data.userId,
    showId: data.showId,
    totalPrice: data.totalPrice,
    paymentStatus: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Update seat statuses
  data.seatIds.forEach(seatId => {
    updateSeatStatus(data.showId, seatId, 'booked');
  });
  
  bookings.push(newBooking);
  saveBookings(bookings);
  
  return newBooking;
}

// Get bookings for a user
export function getUserBookings(userId: number): (Booking & { show: Show & { movie: Movie, theatre: Theatre } })[] {
  const bookings = getBookings();
  
  return bookings
    .filter(b => b.userId === userId)
    .map(b => {
      const show = getShow(b.showId);
      if (!show) return null;
      
      return {
        ...b,
        show: {
          ...show,
          movie: getMovie(show.movieId)!
        }
      };
    })
    .filter((b): b is Booking & { show: Show & { movie: Movie, theatre: Theatre } } => b !== null);
}

// Get booking by ID
export function getBookingById(id: number): (Booking & { show: Show & { movie: Movie, theatre: Theatre } }) | null {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === id);
  
  if (!booking) return null;
  
  const show = getShow(booking.showId);
  if (!show) return null;
  
  return {
    ...booking,
    show: {
      ...show,
      movie: getMovie(show.movieId)!
    }
  };
}

// Mock users for demo
export const mockUsers = [
  { id: 1, email: 'demo@example.com', password: 'demo123', name: 'Demo User' },
  { id: 2, email: 'test@example.com', password: 'test123', name: 'Test User' },
];

// Auth functions
export function loginUser(email: string, password: string): { user: typeof mockUsers[0]; token: string } | null {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) return null;
  
  const token = `mock-token-${Date.now()}`;
  localStorage.setItem('tickethub_token', token);
  localStorage.setItem('tickethub_user', JSON.stringify(user));
  
  return { user, token };
}

export function signupUser(data: { email: string; password: string; name: string }): { user: typeof mockUsers[0]; token: string } | null {
  const existing = mockUsers.find(u => u.email === data.email);
  if (existing) return null;
  
  const newUser = {
    id: mockUsers.length + 1,
    ...data,
  };
  mockUsers.push(newUser);
  
  const token = `mock-token-${Date.now()}`;
  localStorage.setItem('tickethub_token', token);
  localStorage.setItem('tickethub_user', JSON.stringify(newUser));
  
  return { user: newUser, token };
}

export function getCurrentUser(): typeof mockUsers[0] | null {
  const stored = localStorage.getItem('tickethub_user');
  return stored ? JSON.parse(stored) : null;
}

export function logoutUser(): void {
  localStorage.removeItem('tickethub_token');
  localStorage.removeItem('tickethub_user');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('tickethub_token');
}

