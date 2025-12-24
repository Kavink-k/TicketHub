import { Link } from "wouter";
import { type Movie } from "@shared/schema";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <div className={cn(
        "group cursor-pointer flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1", 
        className
      )}>
        {/* Poster Container */}
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg shadow-black/5 border border-border/50">
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Rating Badge */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pt-12 flex items-center justify-between text-white">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold">8.5/10</span>
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">
              {movie.rating || "UA"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {movie.genre}
          </p>
        </div>
      </div>
    </Link>
  );
}
