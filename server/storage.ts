
import { 
  users, movies, theatres, shows, seats, bookings, snacks, bookingSnacks,
  type User, type InsertUser, type Movie, type Theatre, type Show, type Seat, type Booking, type Snack,
  type InsertBooking
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  db: typeof db;
  
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Movies
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;

  // Theatres
  getTheatres(city?: string): Promise<Theatre[]>;

  // Shows
  getShows(movieId: number, theatreId?: number): Promise<(Show & { theatre: Theatre })[]>;
  getShow(id: number): Promise<Show | undefined>;

  // Seats
  getSeats(showId: number): Promise<Seat[]>;
  updateSeatStatus(id: number, status: string): Promise<Seat | undefined>;
  updateSeatsStatus(ids: number[], status: string): Promise<void>;

  // Snacks
  getSnacks(): Promise<Snack[]>;

  // Bookings
  createBooking(userId: number, booking: InsertBooking, seatIds: number[], snackItems?: { snackId: number, quantity: number }[]): Promise<Booking>;
  getBookings(userId: number): Promise<(Booking & { show: Show, movie: Movie })[]>;
  getBooking(id: number): Promise<(Booking & { show: Show, movie: Movie }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  db: typeof db;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
    this.db = db;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getMovies(): Promise<Movie[]> {
    return await db.select().from(movies);
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async getTheatres(city?: string): Promise<Theatre[]> {
    if (city) {
      return await db.select().from(theatres).where(eq(theatres.city, city));
    }
    return await db.select().from(theatres);
  }

  async getShows(movieId: number, theatreId?: number): Promise<(Show & { theatre: Theatre })[]> {
    let query = db
      .select({
        ...shows,
        theatre: theatres,
      })
      .from(shows)
      .innerJoin(theatres, eq(shows.theatreId, theatres.id))
      .where(eq(shows.movieId, movieId));

    if (theatreId) {
      query = query.where(eq(shows.theatreId, theatreId)) as any;
    }

    const results = await query;
    return results.map(r => ({ ...r.shows, theatre: r.theatre }));
  }

  async getShow(id: number): Promise<Show | undefined> {
    const [show] = await db.select().from(shows).where(eq(shows.id, id));
    return show;
  }

  async getSeats(showId: number): Promise<Seat[]> {
    return await db.select().from(seats).where(eq(seats.showId, showId)).orderBy(seats.id);
  }

  async updateSeatStatus(id: number, status: string): Promise<Seat | undefined> {
    const [seat] = await db.update(seats)
      .set({ status })
      .where(eq(seats.id, id))
      .returning();
    return seat;
  }

  async updateSeatsStatus(ids: number[], status: string): Promise<void> {
    if (ids.length === 0) return;
    await db.update(seats)
      .set({ status })
      .where(sql`${seats.id} IN ${ids}`);
  }

  async getSnacks(): Promise<Snack[]> {
    return await db.select().from(snacks);
  }

  async createBooking(userId: number, booking: InsertBooking, seatIds: number[], snackItems: { snackId: number, quantity: number }[] = []): Promise<Booking> {
    // Transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // 1. Create Booking
      const [newBooking] = await tx.insert(bookings).values({
        ...booking,
        userId,
        paymentStatus: 'completed', // Mock payment success
      }).returning();

      // 2. Update Seats
      if (seatIds.length > 0) {
        await tx.update(seats)
          .set({ status: 'booked' })
          .where(sql`${seats.id} IN ${seatIds}`);
      }

      // 3. Add Snacks
      if (snackItems.length > 0) {
        await tx.insert(bookingSnacks).values(
          snackItems.map(item => ({
            bookingId: newBooking.id,
            snackId: item.snackId,
            quantity: item.quantity
          }))
        );
      }

      return newBooking;
    });
  }

  async getBookings(userId: number): Promise<(Booking & { show: Show, movie: Movie })[]> {
    const results = await db.select({
      booking: bookings,
      show: shows,
      movie: movies
    })
    .from(bookings)
    .innerJoin(shows, eq(bookings.showId, shows.id))
    .innerJoin(movies, eq(shows.movieId, movies.id))
    .where(eq(bookings.userId, userId))
    .orderBy(sql`${bookings.createdAt} DESC`);

    return results.map(r => ({ ...r.booking, show: r.show, movie: r.movie }));
  }

  async getBooking(id: number): Promise<(Booking & { show: Show, movie: Movie }) | undefined> {
    const [result] = await db.select({
      booking: bookings,
      show: shows,
      movie: movies
    })
    .from(bookings)
    .innerJoin(shows, eq(bookings.showId, shows.id))
    .innerJoin(movies, eq(shows.movieId, movies.id))
    .where(eq(bookings.id, id));

    if (!result) return undefined;
    return { ...result.booking, show: result.show, movie: result.movie };
  }
}

export const storage = new DatabaseStorage();
