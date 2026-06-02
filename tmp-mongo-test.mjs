import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const uri = process.env.MONGODB_URI || process.env.MONGO_URI
if (!uri) {
  throw new Error('No MongoDB URI')
}

const client = new MongoClient(uri, {
  retryWrites: true,
  w: 'majority',
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  family: 4,
  tls: uri.startsWith('mongodb+srv://'),
})

try {
  await client.connect()
  const db = client.db(process.env.MONGODB_DB || process.env.MONGO_DB || 'perpustakaan')
  const books = await db.collection('books').find().sort({ createdAt: -1 }).toArray()
  console.log('SUCCESS', books.length)
} catch (e) {
  console.error('ERROR', e)
} finally {
  await client.close()
}
