  import { connectToDatabase } from '../lib/db';
  import { ObjectId } from 'mongodb';
  import bcrypt from 'bcryptjs';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  export default async function handler(req: any, res: any) {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const { db } = await connectToDatabase();
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: any = {
      _id: new ObjectId(),
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        role: 'user',
        address: '',
        memberSince: new Date().toISOString().split('T')[0],
        status: 'active',
        totalLoans: 0,
      };

      await usersCollection.insertOne(newUser);

      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({
        success: true,
        user: userWithoutPassword,
        message: 'Registration successful',
      });
    } catch (error) {
      console.error('Register Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
 