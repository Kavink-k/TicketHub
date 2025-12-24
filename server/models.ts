import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_NAME = 'movie_booking',
  DB_USER = 'kavin',
  DB_PASSWORD = 'kingkavin000',
  NODE_ENV = 'development'
} = process.env;

// Create Sequelize instance with MySQL
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT),
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// User Model
interface UserAttributes {
  id: number;
  email: string;
  password: string;
  name: string;
  phone?: string;
  city?: string;
  createdAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public phone?: string;
  public city?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Movie Model
interface MovieAttributes {
  id: number;
  title: string;
  genre: string;
  duration: number;
  rating?: string;
  description: string;
  posterUrl: string;
  trailerUrl?: string;
  releaseDate?: Date;
}

interface MovieCreationAttributes extends Optional<MovieAttributes, 'id'> {}

class Movie extends Model<MovieAttributes, MovieCreationAttributes> implements MovieAttributes {
  public id!: number;
  public title!: string;
  public genre!: string;
  public duration!: number;
  public rating?: string;
  public description!: string;
  public posterUrl!: string;
  public trailerUrl?: string;
  public releaseDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Theatre Model
interface TheatreAttributes {
  id: number;
  name: string;
  city: string;
  location: string;
  totalScreens: number;
}

interface TheatreCreationAttributes extends Optional<TheatreAttributes, 'id' | 'totalScreens'> {}

class Theatre extends Model<TheatreAttributes, TheatreCreationAttributes> implements TheatreAttributes {
  public id!: number;
  public name!: string;
  public city!: string;
  public location!: string;
  public totalScreens!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Show Model
interface ShowAttributes {
  id: number;
  movieId: number;
  theatreId: number;
  showTime: Date;
  format: string;
  availableSeats: number;
}

interface ShowCreationAttributes extends Optional<ShowAttributes, 'id'> {}

class Show extends Model<ShowAttributes, ShowCreationAttributes> implements ShowAttributes {
  public id!: number;
  public movieId!: number;
  public theatreId!: number;
  public showTime!: Date;
  public format!: string;
  public availableSeats!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Seat Model
interface SeatAttributes {
  id: number;
  showId: number;
  seatNumber: string;
  category: string;
  price: number;
  status: string;
}

interface SeatCreationAttributes extends Optional<SeatAttributes, 'id' | 'status'> {}

class Seat extends Model<SeatAttributes, SeatCreationAttributes> implements SeatAttributes {
  public id!: number;
  public showId!: number;
  public seatNumber!: string;
  public category!: string;
  public price!: number;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Booking Model
interface BookingAttributes {
  id: number;
  userId: number;
  showId: number;
  totalPrice: number;
  paymentStatus: string;
  createdAt?: Date;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'createdAt' | 'paymentStatus'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public userId!: number;
  public showId!: number;
  public totalPrice!: number;
  public paymentStatus!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Snack Model
interface SnackAttributes {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface SnackCreationAttributes extends Optional<SnackAttributes, 'id'> {}

class Snack extends Model<SnackAttributes, SnackCreationAttributes> implements SnackAttributes {
  public id!: number;
  public name!: string;
  public price!: number;
  public imageUrl?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// BookingSnack Model (Junction Table)
interface BookingSnackAttributes {
  id: number;
  bookingId: number;
  snackId: number;
  quantity: number;
}

interface BookingSnackCreationAttributes extends Optional<BookingSnackAttributes, 'id'> {}

class BookingSnack extends Model<BookingSnackAttributes, BookingSnackCreationAttributes> implements BookingSnackAttributes {
  public id!: number;
  public bookingId!: number;
  public snackId!: number;
  public quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize models
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
});

Movie.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  posterUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  trailerUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'movies',
  timestamps: true,
});

Theatre.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalScreens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  sequelize,
  tableName: 'theatres',
  timestamps: true,
});

Show.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id',
    },
  },
  theatreId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'theatres',
      key: 'id',
    },
  },
  showTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'shows',
  timestamps: true,
});

Seat.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  showId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shows',
      key: 'id',
    },
  },
  seatNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'available',
  },
}, {
  sequelize,
  tableName: 'seats',
  timestamps: true,
});

Booking.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  showId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shows',
      key: 'id',
    },
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'bookings',
  timestamps: true,
});

Snack.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'snacks',
  timestamps: true,
});

BookingSnack.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id',
    },
  },
  snackId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'snacks',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'booking_snacks',
  timestamps: true,
});

// Define Associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Movie.hasMany(Show, { foreignKey: 'movieId', as: 'shows' });
Show.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Theatre.hasMany(Show, { foreignKey: 'theatreId', as: 'shows' });
Show.belongsTo(Theatre, { foreignKey: 'theatreId', as: 'theatre' });

Show.hasMany(Seat, { foreignKey: 'showId', as: 'seats' });
Seat.belongsTo(Show, { foreignKey: 'showId', as: 'show' });

Show.hasMany(Booking, { foreignKey: 'showId', as: 'bookings' });
Booking.belongsTo(Show, { foreignKey: 'showId', as: 'show' });

Booking.hasMany(BookingSnack, { foreignKey: 'bookingId', as: 'bookingSnacks' });
BookingSnack.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Snack.hasMany(BookingSnack, { foreignKey: 'snackId', as: 'bookingSnacks' });
BookingSnack.belongsTo(Snack, { foreignKey: 'snackId', as: 'snack' });

// Export all models and sequelize instance
export {
  User,
  Movie,
  Theatre,
  Show,
  Seat,
  Booking,
  Snack,
  BookingSnack,
  sequelize,
};
