import { connectToDatabase } from './lib/db';
import { DEFAULT_USERS, DEFAULT_BOOKS, DEFAULT_LOANS } from '../src/app/data/mockData';
import bcrypt from 'bcryptjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: any, res: any) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { db } = await connectToDatabase();

    const usersCollection = db.collection('users');
    const existingUsers = await usersCollection.countDocuments();
    if (existingUsers === 0) {
      const hashedUsers = await Promise.all(
        DEFAULT_USERS.map(async (u) => ({
          ...u,
          // simpan _id tetap sesuai mockData (string) agar UI yang pakai legacy id tetap jalan
          _id: u.id,
          password: await bcrypt.hash(u.password, 10),
        }))
      );
      await usersCollection.insertMany(hashedUsers as any);
    }

    const booksCollection = db.collection('books');
    const existingBooks = await booksCollection.countDocuments();
    if (existingBooks === 0) {
      await booksCollection.insertMany(
        DEFAULT_BOOKS.map((b) => ({ ...b, _id: b.id })) as any
      );
    }

    const loansCollection = db.collection('loans');
    const existingLoans = await loansCollection.countDocuments();
    if (existingLoans === 0) {
      await loansCollection.insertMany(
        DEFAULT_LOANS.map((l) => ({ ...l, _id: l.id })) as any
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully',
      stats: {
        users: await usersCollection.countDocuments(),
        books: await booksCollection.countDocuments(),
        loans: await loansCollection.countDocuments(),
      },
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
