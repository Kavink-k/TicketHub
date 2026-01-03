import { z } from 'zod';

// Type definitions for Sequelize models (matching server/models.ts)
export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  phone?: string;
  city?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type Movie = {
  id: number;
  title: string;
  genre: string;
  duration: number;
  rating?: string;
  description: string;
  posterUrl: string;
  trailerUrl?: string;
  releaseDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type Theatre = {
  id: number;
  name: string;
  city: string;
  location: string;
  totalScreens: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type Show = {
  id: number;
  movieId: number;
  theatreId: number;
  showTime: Date | string;
  format: string;
  availableSeats: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type Seat = {
  id: number;
  showId: number;
  seatNumber: string;
  category: string;
  price: number;
  status: 'available' | 'booked' | 'selected';
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type Booking = {
  id: number;
  userId: number;
  showId: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type Snack = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type BookingSnack = {
  id: number;
  bookingId: number;
  snackId: number;
  quantity: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  username: z.string().email(), // using email as username
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createBookingSchema = z.object({
  showId: z.number(),
  seatIds: z.array(z.number()),
  snacks: z.array(z.object({ 
    snackId: z.number(), 
    quantity: z.number().min(1) 
  })).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateSeatStatusSchema = z.object({
  status: z.enum(['available', 'booked', 'selected']),
});

export type UpdateSeatStatusInput = z.infer<typeof updateSeatStatusSchema>;

export const theatreQuerySchema = z.object({
  city: z.string().optional(),
});

export type TheatreQueryInput = z.infer<typeof theatreQuerySchema>;

export const showQuerySchema = z.object({
  movieId: z.string(),
  theatreId: z.string().optional(),
});

export type ShowQueryInput = z.infer<typeof showQuerySchema>;
