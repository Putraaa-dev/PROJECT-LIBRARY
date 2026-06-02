import dotenv from 'dotenv'
import express from 'express'
import path from 'path'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })
import { fileURLToPath } from 'url'
import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

const uri = process.env.MONGODB_URI || process.env.MONGO_URI
const dbName = process.env.MONGODB_DB || process.env.MONGO_DB || 'perpustakaan'

if (!uri) {
  console.error('Missing MongoDB connection URI. Set MONGODB_URI or MONGO_URI in your environment.')
  process.exit(1)
}

let cachedDb = null

const DEFAULT_USERS = [
  {
    id: 'u1',
    name: 'Budi Santoso',
    email: 'admin@perpus.id',
    password: 'admin123',
    role: 'admin',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 1, Jakarta',
    memberSince: '2022-01-01',
    status: 'active',
    avatar: 'https://api.dicebear.com/6.x/initials/png?seed=AdminBudi&backgroundColor=4f46e5',
  },
  {
    id: 'u2',
    name: 'Siti Rahayu',
    email: 'petugas@perpus.id',
    password: 'petugas123',
    role: 'petugas',
    phone: '082345678901',
    address: 'Jl. Sudirman No. 5, Bandung',
    memberSince: '2022-03-15',
    status: 'active',
    avatar: 'https://api.dicebear.com/6.x/initials/png?seed=PetugasSiti&backgroundColor=0ea5e9',
  },
  {
    id: 'u3',
    name: 'Ahmad Fauzi',
    email: 'user@perpus.id',
    password: 'user123',
    role: 'user',
    phone: '083456789012',
    address: 'Jl. Gatot Subroto No. 10, Surabaya',
    memberSince: '2023-02-20',
    status: 'active',
    avatar: 'https://api.dicebear.com/6.x/initials/png?seed=AnggotaAhmad&backgroundColor=22c55e',
  },
]

const DEFAULT_BOOKS = [
  {
    id: 'b1',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    isbn: '978-979-1985-00-4',
    category: 'Fiksi',
    publisher: 'Bentang Pustaka',
    year: 2005,
    stock: 5,
    available: 3,
    description: 'Novel inspiratif tentang perjuangan anak-anak Belitung dalam meraih pendidikan dan mimpi mereka.',
    pages: 529,
    language: 'Indonesia',
    addedAt: '2023-01-10',
    rating: 4.8,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'b2',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    isbn: '978-979-407-946-8',
    category: 'Fiksi',
    publisher: 'Lentera Dipantara',
    year: 1980,
    stock: 4,
    available: 2,
    description: 'Novel klasik tentang pergolakan sosial Indonesia melalui kisah Minke dan Annelies.',
    pages: 535,
    language: 'Indonesia',
    addedAt: '2023-01-15',
    rating: 4.9,
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'b3',
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '978-0-593-18929-0',
    category: 'Pengembangan Diri',
    publisher: 'Avery Publishing',
    year: 2018,
    stock: 6,
    available: 4,
    description: 'Panduan praktis untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk.',
    pages: 320,
    language: 'Inggris',
    addedAt: '2023-02-01',
    rating: 4.7,
    cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'b4',
    title: 'Sapiens: Sejarah Singkat Umat Manusia',
    author: 'Yuval Noah Harari',
    isbn: '978-0-06-231609-7',
    category: 'Sejarah',
    publisher: 'Harper Perennial',
    year: 2011,
    stock: 3,
    available: 1,
    description: 'Perjalanan evolusi Homo sapiens dari prasejarah hingga era modern.',
    pages: 443,
    language: 'Indonesia',
    addedAt: '2023-03-12',
    rating: 4.8,
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'b5',
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    isbn: '978-1-63384-401-2',
    category: 'Bisnis & Ekonomi',
    publisher: 'Plata Publishing',
    year: 2017,
    stock: 4,
    available: 4,
    description: 'Buku keuangan pribadi yang mengubah cara banyak orang berpikir tentang uang dan investasi.',
    pages: 240,
    language: 'Indonesia',
    addedAt: '2023-04-05',
    rating: 4.5,
    cover: 'https://images.unsplash.com/photo-1512418490979-92798cec25e8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'b6',
    title: 'Mindset: The New Psychology of Success',
    author: 'Carol S. Dweck',
    isbn: '978-1-4767-1838-8',
    category: 'Pengembangan Diri',
    publisher: 'Ballantine Books',
    year: 2006,
    stock: 5,
    available: 5,
    description: 'Menjelaskan perbedaan mindset tetap dan bertumbuh serta dampaknya pada prestasi hidup.',
    pages: 320,
    language: 'Inggris',
    addedAt: '2023-05-18',
    rating: 4.6,
    cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
  },
]

async function seedInitialData(db) {
  for (const user of DEFAULT_USERS) {
    const existingUser = await db.collection('users').findOne({ email: user.email })
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      await db.collection('users').insertOne({
        ...user,
        _id: user.id,
        password: hashedPassword,
      })
      console.log(`Seeded default user: ${user.email}`)
    }
  }

  const booksCount = await db.collection('books').countDocuments()
  if (booksCount === 0) {
    const booksToInsert = DEFAULT_BOOKS.map((b) => ({ ...b, _id: b.id }))
    console.log(`Seeding ${booksToInsert.length} default books`)
    if (booksToInsert.length > 0) {
      await db.collection('books').insertMany(booksToInsert)
      console.log('Seeded default books')
    } else {
      console.warn('No default books found to seed')
    }
  }

  const loansCount = await db.collection('loans').countDocuments()
  if (loansCount === 0) {
    // Leave loans collection empty when no initial loans exist.
    console.log('No initial loans to seed')
  }
}

let inMemoryDb = {
  books: [],
  users: [],
  loans: [],
}

async function getDb() {
  if (cachedDb) {
    return cachedDb
  }

  try {
    const tlsAllowInvalidCertificates = process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === 'true'
    const serverSelectionTimeoutMS = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 5000)

    const client = new MongoClient(uri, {
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS,
      family: 4,
      tls: uri.startsWith('mongodb+srv://'),
      tlsAllowInvalidCertificates,
    })

    if (tlsAllowInvalidCertificates) {
      console.warn('MongoDB TLS certificate validation is disabled by MONGODB_TLS_ALLOW_INVALID_CERTS')
    }

    console.log('Connecting to MongoDB...')
    await client.connect()
    console.log('MongoDB connected successfully')

    cachedDb = client.db(dbName)
    await seedInitialData(cachedDb)
    return cachedDb
  } catch (error) {
    console.error('MongoDB connection error:', error?.message ?? error)
    console.warn('⚠️  Falling back to in-memory database')
    
    // Initialize in-memory database with default data
    inMemoryDb.users = DEFAULT_USERS.map(user => ({
      ...user,
      _id: new ObjectId(),
    }))
    inMemoryDb.books = DEFAULT_BOOKS.map(book => ({
      ...book,
      _id: new ObjectId(),
    }))

    // Return a mock database object that works like MongoDB
    return createInMemoryDbAdapter()
  }
}

function createInMemoryDbAdapter() {
  return {
    collection(name) {
      return {
        find(query = {}) {
          const collection = inMemoryDb[name] || []
          const filtered = collection.filter(doc => {
            if (query._id) {
              return doc._id?.toString?.() === query._id?.toString?.() || doc._id === query._id
            }
            return true
          })
          
          const self = {
            async toArray() {
              return filtered
            },
            sort(sortObj) {
              return self
            },
          }
          return self
        },
        async findOne(query = {}) {
          const collection = inMemoryDb[name] || []
          if (query._id) {
            return collection.find(doc => doc._id?.toString?.() === query._id?.toString?.() || doc._id === query._id)
          }
          return collection[0] || null
        },
        async findOneAndUpdate(filter, update, options = {}) {
          const collection = inMemoryDb[name] || []
          const index = collection.findIndex(doc => doc._id?.toString?.() === filter._id?.toString?.() || doc._id === filter._id)
          if (index !== -1) {
            const updated = { ...collection[index], ...update.$set }
            collection[index] = updated
            return { value: updated }
          }
          return { value: null }
        },
        async updateOne(filter, update) {
          const collection = inMemoryDb[name] || []
          const index = collection.findIndex(doc => doc._id?.toString?.() === filter._id?.toString?.() || doc._id === filter._id)
          if (index !== -1) {
            collection[index] = { ...collection[index], ...update.$set }
            return { modifiedCount: 1 }
          }
          return { modifiedCount: 0 }
        },
        async insertOne(doc) {
          const collection = inMemoryDb[name] || []
          const newDoc = { ...doc, _id: new ObjectId() }
          collection.push(newDoc)
          inMemoryDb[name] = collection
          return { insertedId: newDoc._id }
        },
        async deleteOne(filter) {
          const collection = inMemoryDb[name] || []
          const index = collection.findIndex(doc => doc._id?.toString?.() === filter._id?.toString?.() || doc._id === filter._id)
          if (index !== -1) {
            collection.splice(index, 1)
            return { deletedCount: 1 }
          }
          return { deletedCount: 0 }
        },
      }
    },
  }
}

function toObjectId(id) {
  try {
    return new ObjectId(id)
  } catch {
    return null
  }
}

function toIdFilter(id) {
  const objectId = toObjectId(id)
  return objectId ? { _id: objectId } : { _id: id }
}

app.get('/api/books', async (req, res) => {
  try {
    const db = await getDb()
    const books = await db.collection('books').find().sort({ createdAt: -1 }).toArray()
    res.json(books)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/books', async (req, res) => {
  try {
    const db = await getDb()
    const book = {
      ...req.body,
      createdAt: new Date().toISOString(),
    }
    const result = await db.collection('books').insertOne(book)
    res.status(201).json({ ...book, _id: result.insertedId.toString() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/books/:id', async (req, res) => {
  try {
    const db = await getDb()
    const filter = toIdFilter(req.params.id)

    const update = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection('books').findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      return res.status(404).json({ error: 'Book not found' })
    }

    res.json(result.value)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/books/:id', async (req, res) => {
  try {
    const db = await getDb()
    const filter = toIdFilter(req.params.id)

    const result = await db.collection('books').deleteOne(filter)
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Book not found' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const db = await getDb()
    const users = await db.collection('users').find().toArray()
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, phone, address, role, status, avatar } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    const db = await getDb()
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: role || 'user',
      memberSince: new Date().toISOString(),
      status: status || 'active',
      avatar: avatar || '',
    }

    const result = await db.collection('users').insertOne(user)
    res.status(201).json({ message: 'User created successfully', userId: result.insertedId.toString() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/seed', async (req, res) => {
  try {
    const db = await getDb()
    await seedInitialData(db)
    res.json({ success: true, message: 'Seed data berhasil dijalankan.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const db = await getDb()
    const filter = toIdFilter(req.params.id)

    const update = { ...req.body, updatedAt: new Date().toISOString() }
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10)
    }

    const result = await db.collection('users').findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.value)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    const db = await getDb()
    const filter = toIdFilter(req.params.id)

    const result = await db.collection('users').deleteOne(filter)
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const db = await getDb()
    const user = await db.collection('users').findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const passwordMatches = user.password
      ? (await bcrypt.compare(password, user.password)) || password === user.password
      : false

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const responseUser = {
      id: user._id?.toString?.() ?? user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      memberSince: user.memberSince,
      status: user.status,
      avatar: user.avatar,
    }

    res.json({ user: responseUser, message: 'Login berhasil' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    const db = await getDb()
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: 'user',
      memberSince: new Date().toISOString(),
      status: 'active',
      avatar: '',
    }

    const result = await db.collection('users').insertOne(user)
    res.status(201).json({ message: 'Registrasi berhasil', userId: result.insertedId.toString() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/loans', async (req, res) => {
  try {
    const db = await getDb()
    const loans = await db.collection('loans').find().sort({ createdAt: -1 }).toArray()
    res.json(loans)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/loans', async (req, res) => {
  try {
    const { action, loanId, bookId, userId, userName, userEmail, notes } = req.body || {}
    const db = await getDb()

    if (action === 'request') {
      const loan = {
        bookId,
        userId,
        userName,
        userEmail,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      const result = await db.collection('loans').insertOne(loan)
      return res.status(201).json({ ...loan, _id: result.insertedId.toString() })
    }

    if (!loanId) {
      return res.status(400).json({ error: 'Loan ID is required for this action' })
    }

    const update = {}
    if (action === 'approve') {
      update.status = 'approved'
      update.approvedAt = new Date().toISOString()
    } else if (action === 'reject') {
      update.status = 'rejected'
      update.notes = notes || ''
      update.rejectedAt = new Date().toISOString()
    }

    const filter = toIdFilter(loanId)

    const result = await db.collection('loans').findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      return res.status(404).json({ error: 'Loan not found' })
    }

    res.json(result.value)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/loans/:id', async (req, res) => {
  try {
    const db = await getDb()
    const filter = toIdFilter(req.params.id)

    const result = await db.collection('loans').deleteOne(filter)
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Loan not found' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
