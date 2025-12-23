
import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication first
  setupAuth(app);

  // Movies
  app.get(api.movies.list.path, async (req, res) => {
    const movies = await storage.getMovies();
    res.json(movies);
  });

  app.get(api.movies.get.path, async (req, res) => {
    const movie = await storage.getMovie(Number(req.params.id));
    if (!movie) return res.sendStatus(404);
    res.json(movie);
  });

  // Theatres
  app.get(api.theatres.list.path, async (req, res) => {
    const city = req.query.city as string | undefined;
    const theatres = await storage.getTheatres(city);
    res.json(theatres);
  });

  // Shows
  app.get(api.shows.list.path, async (req, res) => {
    const movieId = req.query.movieId;
    const theatreId = req.query.theatreId;
    
    if (!movieId) return res.sendStatus(400);

    const shows = await storage.getShows(
      Number(movieId),
      theatreId ? Number(theatreId) : undefined
    );
    res.json(shows);
  });

  app.get(api.shows.get.path, async (req, res) => {
    const show = await storage.getShow(Number(req.params.id));
    if (!show) return res.sendStatus(404);
    res.json(show);
  });

  app.get(api.shows.seats.path, async (req, res) => {
    const seats = await storage.getSeats(Number(req.params.id));
    res.json(seats);
  });

  // Seats (Update status - mostly for internal/realtime but added endpoint)
  app.patch(api.seats.updateStatus.path, async (req, res) => {
    const { status } = req.body;
    const seat = await storage.updateSeatStatus(Number(req.params.id), status);
    res.json(seat);
  });

  // Snacks
  app.get(api.snacks.list.path, async (req, res) => {
    const snacks = await storage.getSnacks();
    res.json(snacks);
  });

  // Bookings
  app.post(api.bookings.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { showId, seatIds, snacks } = req.body;
    
    // Calculate total price (Simplified: assuming backend should calculate or trust frontend for now. 
    // Ideally backend fetches seat prices. For MVP, we will fetch seat prices here.)
    
    // Verify seats
    const seats = await storage.getSeats(showId);
    const selectedSeats = seats.filter(s => seatIds.includes(s.id));
    
    // Check if available
    if (selectedSeats.some(s => s.status === 'booked')) {
      return res.status(400).json({ message: "Some seats are already booked" });
    }

    let totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    // Add snacks price
    if (snacks && snacks.length > 0) {
      const allSnacks = await storage.getSnacks();
      snacks.forEach(item => {
        const snack = allSnacks.find(s => s.id === item.snackId);
        if (snack) {
          totalPrice += snack.price * item.quantity;
        }
      });
    }

    const booking = await storage.createBooking(
      req.user!.id,
      { showId, totalPrice, paymentStatus: 'completed' },
      seatIds,
      snacks || []
    );

    res.status(201).json(booking);
  });

  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const bookings = await storage.getBookings(req.user!.id);
    res.json(bookings);
  });

  app.get(api.bookings.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const booking = await storage.getBooking(Number(req.params.id));
    if (!booking) return res.sendStatus(404);
    if (booking.userId !== req.user!.id) return res.sendStatus(403);
    res.json(booking);
  });

  // Seed Data Function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingMovies = await storage.getMovies();
  if (existingMovies.length > 0) return;

  console.log("Seeding database...");

  // Movies
  const movie1 = await storage.db.insert(schema.movies).values({
    title: "Inception",
    genre: "Sci-Fi",
    duration: 148,
    rating: "UA",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7admal4zlWH9O9GLyxHgWTPd.jpg",
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
    releaseDate: new Date("2010-07-16"),
  }).returning();

  const movie2 = await storage.db.insert(schema.movies).values({
    title: "The Dark Knight",
    genre: "Action",
    duration: 152,
    rating: "UA",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
    releaseDate: new Date("2008-07-18"),
  }).returning();

  const movie3 = await storage.db.insert(schema.movies).values({
    title: "Interstellar",
    genre: "Sci-Fi",
    duration: 169,
    rating: "UA",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniL6E8ahMcafCUyGdjEOL.jpg",
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    releaseDate: new Date("2014-11-07"),
  }).returning();

  const movie4 = await storage.db.insert(schema.movies).values({
    title: "Avengers: Endgame",
    genre: "Action",
    duration: 181,
    rating: "UA",
    description: "After the devastating events that wiped out half the universe, the Avengers assemble once more to reverse Thanos' actions and restore balance.",
    posterUrl: "https://image.tmdb.org/t/p/w500/or06FQrDklbnkAqJiVWI0nVjagV.jpg",
    trailerUrl: "https://www.youtube.com/embed/TcMBFSGVi1c",
    releaseDate: new Date("2019-04-26"),
  }).returning();

  const movie5 = await storage.db.insert(schema.movies).values({
    title: "Pulp Fiction",
    genre: "Drama",
    duration: 154,
    rating: "A",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    posterUrl: "https://image.tmdb.org/t/p/w500/dM2w4PZqPHwWQx4isNRjYW6i1F6.jpg",
    trailerUrl: "https://www.youtube.com/embed/s7EdQ4FqbdE",
    releaseDate: new Date("1994-10-14"),
  }).returning();

  const movie6 = await storage.db.insert(schema.movies).values({
    title: "The Shawshank Redemption",
    genre: "Drama",
    duration: 142,
    rating: "A",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    posterUrl: "https://image.tmdb.org/t/p/w500/q6725aR8Zs4IwGMAnUtaDtjH3z8.jpg",
    trailerUrl: "https://www.youtube.com/embed/NmzuHjWmXOc",
    releaseDate: new Date("1994-09-23"),
  }).returning();

  const movie7 = await storage.db.insert(schema.movies).values({
    title: "The Matrix",
    genre: "Sci-Fi",
    duration: 136,
    rating: "UA",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXqfAC.jpg",
    trailerUrl: "https://www.youtube.com/embed/vKQi3bBA1y8",
    releaseDate: new Date("1999-03-31"),
  }).returning();

  const movie8 = await storage.db.insert(schema.movies).values({
    title: "Parasite",
    genre: "Drama",
    duration: 132,
    rating: "UA",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    posterUrl: "https://image.tmdb.org/t/p/w500/7IeUWlBSMDyIwmJ0IB7vyJySXyJ.jpg",
    trailerUrl: "https://www.youtube.com/embed/isloHekVcag",
    releaseDate: new Date("2019-05-30"),
  }).returning();

  const movie9 = await storage.db.insert(schema.movies).values({
    title: "Oppenheimer",
    genre: "Biography",
    duration: 180,
    rating: "UA",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gStzWANeGkN3UNO59pHk2J.jpg",
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxJ8",
    releaseDate: new Date("2023-07-21"),
  }).returning();

  const movie10 = await storage.db.insert(schema.movies).values({
    title: "Dune",
    genre: "Sci-Fi",
    duration: 166,
    rating: "UA",
    description: "Paul Atreides travels to the dangerous planet Arrakis to ensure the future of his family and people in this adaptation of Frank Herbert's epic novel.",
    posterUrl: "https://image.tmdb.org/t/p/w500/lJvsGW63g2sGrAvoznkQ0nRnabw.jpg",
    trailerUrl: "https://www.youtube.com/embed/n9xhJrCXkzs",
    releaseDate: new Date("2021-10-22"),
  }).returning();

  // Theatres
  const theatre1 = await storage.db.insert(schema.theatres).values({
    name: "PVR Cinemas",
    city: "Mumbai",
    location: "Phoenix Marketcity, Kurla",
    totalScreens: 5,
  }).returning();

  const theatre2 = await storage.db.insert(schema.theatres).values({
    name: "INOX",
    city: "Mumbai",
    location: "R-City Mall, Ghatkopar",
    totalScreens: 4,
  }).returning();

  // Snacks
  await storage.db.insert(schema.snacks).values([
    { name: "Salted Popcorn (Large)", price: 350, imageUrl: "https://placehold.co/200x200?text=Popcorn" },
    { name: "Coca Cola (500ml)", price: 150, imageUrl: "https://placehold.co/200x200?text=Coke" },
    { name: "Nachos with Cheese", price: 250, imageUrl: "https://placehold.co/200x200?text=Nachos" },
  ]);

  // Shows
  const show1 = await storage.db.insert(schema.shows).values({
    movieId: movie1[0].id,
    theatreId: theatre1[0].id,
    showTime: new Date(new Date().setHours(18, 0, 0, 0)), // Today 6 PM
    format: "IMAX 2D",
    availableSeats: 60,
  }).returning();

  const show2 = await storage.db.insert(schema.shows).values({
    movieId: movie2[0].id,
    theatreId: theatre1[0].id,
    showTime: new Date(new Date().setHours(21, 0, 0, 0)), // Today 9 PM
    format: "2D",
    availableSeats: 50,
  }).returning();
  
  const show3 = await storage.db.insert(schema.shows).values({
    movieId: movie3[0].id,
    theatreId: theatre2[0].id,
    showTime: new Date(new Date().setHours(14, 0, 0, 0)), // Today 2 PM
    format: "2D",
    availableSeats: 40,
  }).returning();

  // Seats for Show 1 (Grid 10x6)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatData = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let category = 'Normal';
    let price = 200;
    
    if (i < 2) { category = 'VIP'; price = 500; }
    else if (i < 4) { category = 'Premium'; price = 350; }
    
    for (let j = 1; j <= 10; j++) {
      seatData.push({
        showId: show1[0].id,
        seatNumber: `${row}${j}`,
        category,
        price,
        status: 'available'
      });
    }
  }

  // Also seed seats for other shows similarly
  const seatData2 = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let category = 'Normal';
    let price = 180;
    
    if (i < 2) { category = 'VIP'; price = 450; }
    else if (i < 4) { category = 'Premium'; price = 300; }
    
    for (let j = 1; j <= 8; j++) { // Smaller hall
      seatData2.push({
        showId: show2[0].id,
        seatNumber: `${row}${j}`,
        category,
        price,
        status: 'available'
      });
    }
  }
  
    const seatData3 = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let category = 'Normal';
    let price = 150;
    
    if (i < 2) { category = 'VIP'; price = 400; }
    else if (i < 4) { category = 'Premium'; price = 250; }
    
    for (let j = 1; j <= 8; j++) { // Smaller hall
      seatData3.push({
        showId: show3[0].id,
        seatNumber: `${row}${j}`,
        category,
        price,
        status: 'available'
      });
    }
  }

  await storage.db.insert(schema.seats).values(seatData);
  await storage.db.insert(schema.seats).values(seatData2);
  await storage.db.insert(schema.seats).values(seatData3);

  console.log("Database seeded successfully!");
}

import * as schema from "@shared/schema";
