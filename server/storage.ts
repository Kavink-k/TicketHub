import { 
  User, Movie, Theatre, Show, Seat, Booking, Snack, BookingSnack,
  sequelize
} from './models';
import type { Model, ModelStatic } from 'sequelize';
import session from 'express-session';
import MemoryStore from 'memorystore';

// Use MemoryStore for development when MySQL is not available
const MemoryStoreSession = MemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;

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
  createBooking(userId: number, booking: { showId: number; totalPrice: number }, seatIds: number[], snackItems?: { snackId: number, quantity: number }[]): Promise<Booking>;
  getBookings(userId: number): Promise<(Booking & { show: Show, movie: Movie })[]>;
  getBooking(id: number): Promise<(Booking & { show: Show, movie: Movie }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Initialize Memory session store for development
    this.sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Associations are already defined in models.ts, no need to duplicate here
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = await User.findByPk(id, { raw: true });
    return user as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await User.findOne({ where: { email }, raw: true });
    return user as User | undefined;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    await User.create(userData as any);
    
    // Always fetch the user by email to ensure we get the proper ID
    const fetchedUser = await User.findOne({ 
      where: { email: userData.email },
      raw: true // This returns a plain object instead of a Sequelize instance
    });
    
    if (!fetchedUser) {
      throw new Error('Failed to create user');
    }
    
    return fetchedUser as User;
  }

  async getMovies(): Promise<Movie[]> {
    return await Movie.findAll({ order: [['id', 'ASC']] });
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const movie = await Movie.findByPk(id);
    return movie || undefined;
  }

  async getTheatres(city?: string): Promise<Theatre[]> {
    const whereClause = city ? { city } : {};
    return await Theatre.findAll({
      where: whereClause,
      order: [['id', 'ASC']]
    });
  }

  async getShows(movieId: number, theatreId?: number): Promise<(Show & { theatre: Theatre })[]> {
    const whereClause: any = { movieId };
    if (theatreId) {
      whereClause.theatreId = theatreId;
    }

    const shows = await Show.findAll({
      where: whereClause,
      include: [{
        model: Theatre,
        as: 'theatre',
        required: true
      }],
      order: [['showTime', 'ASC']]
    });

    return shows as (Show & { theatre: Theatre })[];
  }

  async getShow(id: number): Promise<Show | undefined> {
    const show = await Show.findByPk(id);
    return show || undefined;
  }

  async getSeats(showId: number): Promise<Seat[]> {
    return await Seat.findAll({
      where: { showId },
      order: [['id', 'ASC']]
    });
  }

  async updateSeatStatus(id: number, status: string): Promise<Seat | undefined> {
    const [affectedRows, updatedSeats] = await Seat.update(
      { status },
      { 
        where: { id },
        returning: true
      }
    );
    return affectedRows > 0 ? updatedSeats[0] : undefined;
  }

  async updateSeatsStatus(ids: number[], status: string): Promise<void> {
    if (ids.length === 0) return;
    await Seat.update(
      { status },
      { where: { id: ids } }
    );
  }

  async getSnacks(): Promise<Snack[]> {
    return await Snack.findAll({ order: [['id', 'ASC']] });
  }

  async createBooking(
    userId: number, 
    booking: { showId: number; totalPrice: number }, 
    seatIds: number[], 
    snackItems: { snackId: number, quantity: number }[] = []
  ): Promise<Booking> {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Create Booking
      const newBooking = await Booking.create({
        ...booking,
        userId,
        paymentStatus: 'completed' // Mock payment success
      }, { transaction });

      // 2. Update Seats
      if (seatIds.length > 0) {
        await Seat.update(
          { status: 'booked' },
          { 
            where: { id: seatIds },
            transaction
          }
        );
      }

      // 3. Add Snacks
      if (snackItems.length > 0) {
        await BookingSnack.bulkCreate(
          snackItems.map(item => ({
            bookingId: newBooking.id,
            snackId: item.snackId,
            quantity: item.quantity
          })),
          { transaction }
        );
      }

      await transaction.commit();
      return newBooking;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getBookings(userId: number): Promise<(Booking & { show: Show, movie: Movie })[]> {
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Show,
          as: 'show',
          include: [
            {
              model: Movie,
              as: 'movie'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return bookings as (Booking & { show: Show, movie: Movie })[];
  }

  async getBooking(id: number): Promise<(Booking & { show: Show, movie: Movie }) | undefined> {
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Show,
          as: 'show',
          include: [
            {
              model: Movie,
              as: 'movie'
            }
          ]
        }
      ]
    });

    return booking as (Booking & { show: Show, movie: Movie }) | undefined;
  }
}

export const storage = new DatabaseStorage();
