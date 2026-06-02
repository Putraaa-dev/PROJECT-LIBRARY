import { connectToDatabase } from './lib/db';
import { ObjectId } from 'mongodb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: any, res: any) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    if (req.method === 'GET') {
      const users = await collection.find({}).toArray();
      const sanitized = users.map((u: any) => {
        const { password, ...rest } = u;
        return rest;
      });
      return res.status(200).json(sanitized);
    }

    if (req.method === 'POST') {
      const user = req.body;
      const existing = await collection.findOne({ email: user.email });
      if (existing) return res.status(409).json({ error: 'Email already exists' });
      const newUser: any = {
        ...user,
        _id: new ObjectId(),
        memberSince: new Date().toISOString().split('T')[0],
        totalLoans: 0,
        status: user.status || 'active',
      };
      await collection.insertOne(newUser);
      const { password, ...rest } = newUser;
      return res.status(201).json(rest);
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body;
      if (!id) return res.status(400).json({ error: 'User ID required' });
      if (data.password === '' || data.password === null) delete data.password;
      try {
        const objectId = new ObjectId(id);
        await collection.updateOne({ _id: objectId }, { $set: data });
      } catch {
        // Fallback untuk string ID
        await collection.updateOne({ _id: id }, { $set: data });
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'User ID required' });
      try {
        const objectId = new ObjectId(id as string);
        await collection.deleteOne({ _id: objectId });
      } catch {
        // Fallback untuk string ID
        await collection.deleteOne({ _id: id as string });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Users API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
