import mongoose from 'mongoose';
import { Book, Transaction } from '../models/index.js';
import User from '../models/User.js';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bibliovault');
console.log('✅ MongoDB connected');

await Transaction.deleteMany({});
await Book.deleteMany({});
await User.deleteMany({});
console.log('🗑  Cleared existing data');

// ─── Users ────────────────────────────────────────────────────────────────────
const users = await User.create([
  { name: 'Admin User',  email: 'admin@bibliovault.com', password: 'Admin@123', role: 'admin',     isActive: true  },
  { name: 'Jane Reader', email: 'user@bibliovault.com',  password: 'User@123',  role: 'user',      isActive: true  },
  { name: 'Alex Chen',   email: 'alex@example.com',      password: 'Alex@123',  role: 'user',      isActive: true  },
  { name: 'Maria Lopez', email: 'maria@example.com',     password: 'Maria@123', role: 'librarian', isActive: true  },
  { name: 'Sam Wilson',  email: 'sam@example.com',       password: 'Sam@123',   role: 'user',      isActive: false },
]);
console.log(`👥 Seeded ${users.length} users`);

// ─── Books ────────────────────────────────────────────────────────────────────
const books = await Book.create([
  { title: 'The Great Gatsby',        author: 'F. Scott Fitzgerald', genre: 'Fiction',         description: 'A novel set in the Jazz Age on Long Island. A tragic love story and social critique of the American Dream.',            totalCopies: 5, available: 3, publishYear: 1925, pages: 180, avgRating: 4.2, ratingCount: 142 },
  { title: 'To Kill a Mockingbird',   author: 'Harper Lee',          genre: 'Fiction',         description: 'A story of racial injustice and the loss of innocence seen through the eyes of young Scout Finch in Alabama.',        totalCopies: 4, available: 2, publishYear: 1960, pages: 281, avgRating: 4.8, ratingCount: 289 },
  { title: 'Clean Code',              author: 'Robert C. Martin',    genre: 'Technology',      description: 'A handbook of agile software craftsmanship. Teaches you how to write better code.',                                    totalCopies: 3, available: 0, publishYear: 2008, pages: 431, avgRating: 4.5, ratingCount: 98  },
  { title: 'Dune',                    author: 'Frank Herbert',       genre: 'Science Fiction', description: 'An epic interstellar journey to the desert planet Arrakis. A saga of politics, religion, and ecology.',               totalCopies: 6, available: 5, publishYear: 1965, pages: 412, avgRating: 4.7, ratingCount: 201 },
  { title: 'The Pragmatic Programmer',author: 'Andrew Hunt',         genre: 'Technology',      description: 'Your journey to mastery in software development. Essential reading for every developer.',                             totalCopies: 2, available: 1, publishYear: 2019, pages: 352, avgRating: 4.6, ratingCount: 77  },
  { title: '1984',                    author: 'George Orwell',       genre: 'Dystopian',       description: 'A chilling portrayal of a totalitarian society under constant surveillance.',                                         totalCopies: 5, available: 4, publishYear: 1949, pages: 328, avgRating: 4.7, ratingCount: 312 },
  { title: 'Sapiens',                 author: 'Yuval Noah Harari',   genre: 'Non-Fiction',     description: 'A brief history of humankind from the Stone Age to the 21st century.',                                               totalCopies: 4, available: 4, publishYear: 2011, pages: 443, avgRating: 4.4, ratingCount: 188 },
  { title: 'The Alchemist',           author: 'Paulo Coelho',        genre: 'Fiction',         description: 'A magical story about following your dreams. A philosophical novel about self-discovery.',                            totalCopies: 3, available: 2, publishYear: 1988, pages: 197, avgRating: 4.3, ratingCount: 256 },
  { title: 'Atomic Habits',           author: 'James Clear',         genre: 'Self-Help',       description: 'An easy and proven way to build good habits and break bad ones.',                                                     totalCopies: 4, available: 3, publishYear: 2018, pages: 319, avgRating: 4.6, ratingCount: 445 },
  { title: 'The Art of War',          author: 'Sun Tzu',             genre: 'Philosophy',      description: 'An ancient Chinese military treatise on strategy and tactics. Timeless wisdom for competition.',                      totalCopies: 5, available: 5, publishYear: -500, pages: 273, avgRating: 4.3, ratingCount: 178 },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',     genre: 'Psychology',      description: 'A groundbreaking tour of the mind exposing two systems that drive the way we think.',                                 totalCopies: 3, available: 2, publishYear: 2011, pages: 499, avgRating: 4.5, ratingCount: 301 },
  { title: 'Design Patterns',         author: 'Gang of Four',        genre: 'Technology',      description: 'Elements of Reusable Object-Oriented Software. The classic reference for design patterns.',                           totalCopies: 2, available: 1, publishYear: 1994, pages: 395, avgRating: 4.4, ratingCount: 65  },
]);
console.log(`📚 Seeded ${books.length} books`);

// ─── Transactions ─────────────────────────────────────────────────────────────
const jane  = users.find(u => u.email === 'user@bibliovault.com');
const alex  = users.find(u => u.email === 'alex@example.com');
const maria = users.find(u => u.email === 'maria@example.com');

const gatsby      = books.find(b => b.title === 'The Great Gatsby');
const mockingbird = books.find(b => b.title === 'To Kill a Mockingbird');
const dune        = books.find(b => b.title === 'Dune');
const pragmatic   = books.find(b => b.title === 'The Pragmatic Programmer');
const sapiens     = books.find(b => b.title === 'Sapiens');

await Transaction.create([
  { user: jane._id,  book: gatsby._id,      status: 'borrowed', borrowedAt: new Date(Date.now() - 5  * 86400000), dueDate: new Date(Date.now() + 9  * 86400000), renewCount: 0 },
  { user: jane._id,  book: mockingbird._id, status: 'borrowed', borrowedAt: new Date(Date.now() - 20 * 86400000), dueDate: new Date(Date.now() - 6  * 86400000), renewCount: 1, fine: 3.00 },
  { user: jane._id,  book: dune._id,        status: 'returned', borrowedAt: new Date(Date.now() - 30 * 86400000), dueDate: new Date(Date.now() - 16 * 86400000), returnedAt: new Date(Date.now() - 17 * 86400000), renewCount: 0 },
  { user: alex._id,  book: pragmatic._id,   status: 'borrowed', borrowedAt: new Date(Date.now() - 3  * 86400000), dueDate: new Date(Date.now() + 11 * 86400000), renewCount: 0 },
  { user: maria._id, book: sapiens._id,     status: 'borrowed', borrowedAt: new Date(Date.now() - 25 * 86400000), dueDate: new Date(Date.now() - 11 * 86400000), renewCount: 2, fine: 5.50 },
]);
console.log('🔄 Seeded 5 transactions');

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n✅ Database seeded!');
console.log('─────────────────────────────────────────────');
console.log('  👤 admin@bibliovault.com  / Admin@123  [admin]');
console.log('  👤 user@bibliovault.com   / User@123   [user]');
console.log('  👤 alex@example.com       / Alex@123   [user]');
console.log('  👤 maria@example.com      / Maria@123  [librarian]');
console.log('  👤 sam@example.com        / Sam@123    [user]');
console.log('─────────────────────────────────────────────');
console.log(`  📚 ${books.length} books | 👥 ${users.length} users | 🔄 5 transactions`);

await mongoose.disconnect();
console.log('🔌 Disconnected');