  import { connectToDatabase } from './lib/db';
  import { ObjectId } from 'mongodb';

  export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('books');

      if (req.method === 'GET') {
        const books = await collection.find({}).toArray();
        return res.status(200).json(books);
      }

      if (req.method === 'POST') {
        const book = req.body;
        const newBook = {
          ...book,
          _id: new ObjectId(),
          addedAt: new Date().toISOString().split('T')[0],
        };
        await collection.insertOne(newBook);
        return res.status(201).json(newBook);
      }

      if (req.method === 'PUT') {
        const { id, ...data } = req.body;
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
        if (!id) return res.status(400).json({ error: 'Book ID required' });
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
      console.error('Books API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
