import { connectToDatabase } from './lib/db';
import { ObjectId } from 'mongodb';

const corsHeaders: { [key: string]: string } = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: any, res: any) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('loans');

    // GET - Ambil semua loans atau berdasarkan userId
    if (req.method === 'GET') {
      const { userId, status } = req.query;
      let query: any = {};
      
      if (userId) query.userId = userId;
      if (status) query.status = status;
      
      const loans = await collection.find(query).sort({ requestDate: -1 }).toArray();
      return res.status(200).json(loans);
    }

    // POST - Buat peminjaman baru
    if (req.method === 'POST') {
        const { userId, userName, userEmail, bookId, bookTitle } = req.body;
        
      if (!userId || !bookId) {
        return res.status(400).json({ error: 'User ID and Book ID required' });
      }

      const newLoan = {
        _id: new ObjectId(),
        userId,
        userName,
        userEmail,
        bookId,
        bookTitle,
        requestDate: new Date().toISOString().split('T')[0],
        dueDate: null,
        returnDate: null,
        status: 'pending',
        notes: '',
      };
      
      await collection.insertOne(newLoan);
      return res.status(201).json(newLoan);
    }

    // PUT - Update status loan (approve/reject/return)
    if (req.method === 'PUT') {
      const { id, status, notes } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({ error: 'Loan ID and status required' });
      }

      const updateData: any = { status, updatedAt: new Date().toISOString() };
      if (notes) updateData.notes = notes;
      
      if (status === 'approved') {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // 7 hari deadline
        updateData.dueDate = dueDate.toISOString().split('T')[0];
      }
      
      if (status === 'returned') {
        updateData.returnDate = new Date().toISOString().split('T')[0];
      }

      try {
        const objectId = new ObjectId(id);
        await collection.updateOne(
          { _id: objectId },
          { $set: updateData }
        );
      } catch {
        // Fallback untuk string ID
        await collection.updateOne(
          { _id: id },
          { $set: updateData }
        );
      }
      
      return res.status(200).json({ success: true });
    }

    // DELETE - Hapus loan
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Loan ID required' });
      
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
    console.error('Loans API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}