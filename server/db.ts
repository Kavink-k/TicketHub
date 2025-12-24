import { sequelize, User, Movie, Theatre, Show, Seat, Booking, Snack, BookingSnack } from './models';

// Initialize models and associations
export const initDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('MySQL connection established successfully.');

    // Sync all models (create tables)
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development' // Auto-alter tables in development
    });
    
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.warn('Unable to connect to MySQL, running without database:', error);
    // Don't throw error - allow server to start without database for development
    console.log('Server will start without database connectivity.');
  }
};

// Export sequelize and models
export {
  sequelize,
  User,
  Movie,
  Theatre,
  Show,
  Seat,
  Booking,
  Snack,
  BookingSnack,
};
