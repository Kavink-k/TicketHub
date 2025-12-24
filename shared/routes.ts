
import { z } from 'zod';
import { 
  insertUserSchema,
  loginSchema,
  createBookingSchema,
  updateSeatStatusSchema,
  theatreQuerySchema,
  showQuerySchema,
  type User,
  type Movie,
  type Theatre,
  type Show,
  type Seat,
  type Booking,
  type Snack
} from './schema';

// Error response schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// API endpoint definitions with type-safe contracts
export const api = {
  auth: {
    signup: {
      method: 'POST' as const,
      path: '/api/auth/signup',
      input: insertUserSchema,
      responses: {
        201: z.custom<User>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: loginSchema,
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  movies: {
    list: {
      method: 'GET' as const,
      path: '/api/movies',
      responses: {
        200: z.array(z.custom<Movie>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/movies/:id',
      responses: {
        200: z.custom<Movie>(),
        404: errorSchemas.notFound,
      },
    },
  },
  theatres: {
    list: {
      method: 'GET' as const,
      path: '/api/theatres',
      input: theatreQuerySchema.optional(),
      responses: {
        200: z.array(z.custom<Theatre>()),
      },
    },
  },
  shows: {
    list: {
      method: 'GET' as const,
      path: '/api/shows',
      input: showQuerySchema.optional(),
      responses: {
        200: z.array(z.custom<Show & { theatre: Theatre }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/shows/:id',
      responses: {
        200: z.custom<Show>(),
        404: errorSchemas.notFound,
      },
    },
    seats: {
      method: 'GET' as const,
      path: '/api/shows/:id/seats',
      responses: {
        200: z.array(z.custom<Seat>()),
      },
    },
  },
  seats: {
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/seats/:id/status',
      input: updateSeatStatusSchema,
      responses: {
        200: z.custom<Seat>(),
        400: errorSchemas.validation,
      },
    },
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: createBookingSchema,
      responses: {
        201: z.custom<Booking>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<Booking & { show: Show & { movie: Movie, theatre: Theatre } }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bookings/:id',
      responses: {
        200: z.custom<Booking & { show: Show & { movie: Movie, theatre: Theatre } }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  snacks: {
    list: {
      method: 'GET' as const,
      path: '/api/snacks',
      responses: {
        200: z.array(z.custom<Snack>()),
      },
    },
  },
};

// Utility function to build URLs with parameters
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Type helpers for API usage
export type ApiEndpoint = typeof api[keyof typeof api][keyof typeof api[keyof typeof api]];
export type ApiMethod = ApiEndpoint['method'];
export type ApiPath = ApiEndpoint['path'];

// Re-export everything from schema for convenience
export * from './schema';
