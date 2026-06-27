import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoServer;

const connectDB = async () => {
  try {
    // Check if we are already connected to database
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    const connStr = process.env.MONGODB_URI;

    if (connStr) {
      try {
        console.log(`Attempting to connect to MONGODB_URI: ${connStr}...`);
        const conn = await mongoose.connect(connStr, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (error) {
        console.warn(`Could not connect to environment MONGODB_URI: ${error.message}`);
        console.log('Falling back to local database checks...');
      }
    }

    // Try default local MongoDB
    try {
      console.log('Checking for local MongoDB at mongodb://127.0.0.1:27017/gtg...');
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/gtg', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.log('No local MongoDB running. Starting in-memory MongoDB server...');
    }

    // Fallback: Start in-memory MongoDB server
    if (process.env.VERCEL) {
      throw new Error('MONGODB_URI environment variable is missing. Please set it in your Vercel project environment variables to connect to your database.');
    }

    const pkg = 'mongodb-memory-server';
    const { MongoMemoryServer } = await import(pkg);
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log(`In-memory MongoDB Server started at: ${uri}`);
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected to In-Memory Database: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
