import { useRoute, Link } from "wouter";
import { useMovie } from "@/hooks/use-movies";
import { useShows } from "@/hooks/use-shows";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, PlayCircle,ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function MovieDetailsPage() {
  const [, params] = useRoute("/movies/:id");
  const movieId = parseInt(params?.id || "0");
  const { data: movie, isLoading: isMovieLoading } = useMovie(movieId);
  const { data: shows, isLoading: isShowsLoading } = useShows(movieId);

  if (isMovieLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="h-96 w-full bg-muted animate-pulse" />
        <div className="container mx-auto p-8 space-y-8">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!movie) return <div>Movie not found</div>;

  // Group shows by theatre
  const showsByTheatre = shows?.reduce((acc, show) => {
    const theatreId = show.theatre.id;
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatre,
        shows: []
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {} as Record<number, { theatre: any, shows: any[] }>);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Movie Banner - With blurred backdrop */}
      <div className="relative w-full h-[480px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110"
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        />

        <div className="absolute inset-0 bg-black/60" /> {/* Dark overlay */}
        <Link href="/" className="absolute top-6 left-6 z-20">
          <Button variant="ghost" className="bg-black/30 text-white hover:bg-black/50 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        
        <div className="container mx-auto px-4 md:px-8 h-full relative z-10 flex items-center gap-8 md:gap-12">
          {/* Poster */}
          <div className="hidden md:block w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shrink-0 border border-white/10">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full border border-white/10">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="font-bold">8.5/10</span>
                <span className="text-white/60">30K Votes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
              </div>
              <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white">{movie.genre}</Badge>
              <Badge variant="outline" className="text-white border-white/30">{movie.rating || "UA"}</Badge>
            </div>

            <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
              {movie.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {shows && shows.length > 0 ? (
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-lg shadow-lg shadow-primary/25"
                  onClick={() => document.getElementById('showtimes-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Book Tickets
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-lg shadow-lg shadow-primary/25"
                  disabled
                >
                  No Shows Available
                </Button>
              )}
              {movie.trailerUrl && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 gap-2"
                  onClick={() => window.open(movie.trailerUrl, '_blank')}
                >
                  <PlayCircle className="w-5 h-5" /> Watch Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shows Section */}
      <div id="showtimes-section" className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-display font-bold">Showtimes</h2>
              {/* Simplified date filter */}
              <div className="flex gap-2">
                <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Today</Button>
                <Button variant="ghost">Tomorrow</Button>
              </div>
            </div>

            {isShowsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : Object.keys(showsByTheatre || {}).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No shows available for this movie yet.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.values(showsByTheatre || {}).map((item: any) => {
                  const { theatre, shows } = item;
                  return (
                  <div key={theatre.id} className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{theatre.name}</h3>
                          <span className="text-xs text-muted-foreground">• {theatre.location}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> M-Ticket Available</span>
                          <span className="flex items-center gap-1 text-orange-500"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Food & Beverage</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {shows.map((show: any) => (
                        <Link key={show.id} href={`/shows/${show.id}/seats`}>
                          <div className="group cursor-pointer flex flex-col items-center border border-border rounded-lg p-2 min-w-[100px] hover:border-primary hover:bg-primary/5 transition-all">
                            <span className="text-sm font-semibold text-green-600 group-hover:text-primary">
                              {format(new Date(show.showTime), "h:mm a")}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                              {show.format}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
