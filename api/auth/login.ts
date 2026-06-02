import { connectToDatabase } from '../lib/db';
import bcrypt from 'bcryptjs';
import { DEFAULT_USERS } from '../../src/app/data/mockData';

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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    let user: any = null;
    try {
      const { db } = await connectToDatabase();
      user = await db.collection('users').findOne({ email });
    } catch (error) {
      user = DEFAULT_USERS.find((u) => u.email === email);
    }

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = user.password && user.password.startsWith('$2a$')
      ? await bcrypt.compare(password, user.password)
      : password === user.password;
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account deactivated' });
    }

    const { password: _, ...authUser } = user;
    return res.status(200).json({
      success: true,
      user: authUser,
      message: `Welcome, ${user.name}!`,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
