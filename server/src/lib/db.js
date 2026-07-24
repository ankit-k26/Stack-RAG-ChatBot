import mongoose from 'mongoose'
import { config } from '../config.js'

export async function connectDB() {
  try {
    await mongoose.connect(config.mongo.uri)
    console.log(`  MongoDB: connected (${mongoose.connection.name})`)
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message)
  })
}
