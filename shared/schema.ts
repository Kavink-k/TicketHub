
import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  duration: integer("duration").notNull(), // in minutes
  rating: text("rating"), // e.g. "UA", "A"
  description: text("description").notNull(),
  posterUrl: text("poster_url").notNull(),
  trailerUrl: text("trailer_url"),
  releaseDate: date("release_date"),
});

export const theatres = pgTable("theatres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  location: text("location").notNull(),
  totalScreens: integer("total_screens").notNull().default(1),
});

export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").references(() => movies.id).notNull(),
  theatreId: integer("theatre_id").references(() => theatres.id).notNull(),
  showTime: timestamp("show_time").notNull(),
  format: text("format").notNull(), // 2D, 3D, IMAX
  availableSeats: integer("available_seats").notNull(),
});

export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),
  showId: integer("show_id").references(() => shows.id).notNull(),
  seatNumber: text("seat_number").notNull(),
  category: text("category").notNull(), // VIP, Premium, Normal
  price: integer("price").notNull(),
  status: text("status").notNull().default('available'), // available, booked, selected
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  showId: integer("show_id").references(() => shows.id).notNull(),
  totalPrice: integer("total_price").notNull(),
  paymentStatus: text("payment_status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const snacks = pgTable("snacks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
});

export const bookingSnacks = pgTable("booking_snacks", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  snackId: integer("snack_id").references(() => snacks.id).notNull(),
  quantity: integer("quantity").notNull(),
});

// Relations
export const showsRelations = relations(shows, ({ one }) => ({
  movie: one(movies, {
    fields: [shows.movieId],
    references: [movies.id],
  }),
  theatre: one(theatres, {
    fields: [shows.theatreId],
    references: [theatres.id],
  }),
}));

export const seatsRelations = relations(seats, ({ one }) => ({
  show: one(shows, {
    fields: [seats.showId],
    references: [shows.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  show: one(shows, {
    fields: [bookings.showId],
    references: [shows.id],
  }),
  snacks: many(bookingSnacks),
}));

export const bookingSnacksRelations = relations(bookingSnacks, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSnacks.bookingId],
    references: [bookings.id],
  }),
  snack: one(snacks, {
    fields: [bookingSnacks.snackId],
    references: [snacks.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMovieSchema = createInsertSchema(movies).omit({ id: true });
export const insertTheatreSchema = createInsertSchema(theatres).omit({ id: true });
export const insertShowSchema = createInsertSchema(shows).omit({ id: true });
export const insertSeatSchema = createInsertSchema(seats).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, paymentStatus: true });
export const insertSnackSchema = createInsertSchema(snacks).omit({ id: true });
export const insertBookingSnackSchema = createInsertSchema(bookingSnacks).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Movie = typeof movies.$inferSelect;
export type Theatre = typeof theatres.$inferSelect;
export type Show = typeof shows.$inferSelect;
export type Seat = typeof seats.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Snack = typeof snacks.$inferSelect;
export type BookingSnack = typeof bookingSnacks.$inferSelect;
