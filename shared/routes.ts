
import { z } from 'zod';
import { 
  insertUserSchema, 
  insertBookingSchema,
  insertBookingSnackSchema,
  users,
  movies,
  theatres,
  shows,
  seats,
  bookings,
  snacks
} from './schema';

export * from './schema'; // Re-export everything for frontend convenience

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

export const api = {
  auth: {
    signup: {
      method: 'POST' as const,
      path: '/api/auth/signup',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string(), // using email as username
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
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
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  movies: {
    list: {
      method: 'GET' as const,
      path: '/api/movies',
      responses: {
        200: z.array(z.custom<typeof movies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/movies/:id',
      responses: {
        200: z.custom<typeof movies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  theatres: {
    list: {
      method: 'GET' as const,
      path: '/api/theatres',
      input: z.object({ city: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof theatres.$inferSelect>()),
      },
    },
  },
  shows: {
    list: {
      method: 'GET' as const,
      path: '/api/shows',
      input: z.object({ movieId: z.string(), theatreId: z.string().optional() }).optional(), // query params are strings
      responses: {
        200: z.array(z.custom<typeof shows.$inferSelect & { theatre: typeof theatres.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/shows/:id',
      responses: {
        200: z.custom<typeof shows.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    seats: {
      method: 'GET' as const,
      path: '/api/shows/:id/seats',
      responses: {
        200: z.array(z.custom<typeof seats.$inferSelect>()),
      },
    },
  },
  seats: {
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/seats/:id/status',
      input: z.object({ status: z.enum(['available', 'booked', 'selected']) }),
      responses: {
        200: z.custom<typeof seats.$inferSelect>(),
      },
    },
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: z.object({
        showId: z.number(),
        seatIds: z.array(z.number()),
        snacks: z.array(z.object({ snackId: z.number(), quantity: z.number() })).optional(),
      }),
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings', // user specific
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { show: typeof shows.$inferSelect, movie: typeof movies.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bookings/:id',
      responses: {
        200: z.custom<typeof bookings.$inferSelect & { show: typeof shows.$inferSelect, movie: typeof movies.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  snacks: {
    list: {
      method: 'GET' as const,
      path: '/api/snacks',
      responses: {
        200: z.array(z.custom<typeof snacks.$inferSelect>()),
      },
    },
  },
};

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
