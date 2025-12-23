import { useMovies } from "@/hooks/use-movies";
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChevronRight } from "lucide-react";
import heroImage from "@assets/hero-placeholder.jpg"; // Placeholder, handled in vite

export default function HomePage() {
  const { data: movies, isLoading } = useMovies();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Carousel - Simplified for MVP */}
      <div className="w-full bg-slate-900 overflow-hidden relative">
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-2xl text-white space-y-6">
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Book Tickets for the Biggest Hits
            </h1>
            <p className="text-lg text-slate-300 max-w-lg">
              Experience the magic of cinema with the best seats in the house. Pre-book your snacks and skip the lines.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/30">
              Browse Movies
            </Button>
          </div>
        </div>
        {/* Abstract background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent z-0" />
        {/* Placeholder image background */}
        <img 
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop" 
          /* cinema screen and seats */
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay -z-10"
          alt="Cinema"
        />
      </div>

      {/* Recommended Movies Section */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground">Recommended Movies</h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80 gap-1 pr-0 hover:bg-transparent">
            See All <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[2/3] rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {movies?.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>

      {/* Events Banner */}
      <div className="container mx-auto px-4 md:px-8 py-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-display font-bold mb-4">Endless Entertainment</h2>
          <p className="mb-8 opacity-90">Concerts, Stand-up Comedy, Workshops & More</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-purple-600">
              Explore Events
            </Button>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        </div>
      </div>

      {/* Footer - Push to bottom */}
      <div className="flex-1" />
      <Footer />
    </div>
  );
}
