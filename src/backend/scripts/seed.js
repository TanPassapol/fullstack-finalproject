const mongoose = require('mongoose');
const { Book } = require('../models/index');
const User = require('../models/User');
require('dotenv').config();

const BOOKS = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', genre: 'Fiction', description: 'A novel set in the Jazz Age on Long Island.', totalCopies: 5, available: 5, publishYear: 1925, pages: 180, avgRating: 4.2, ratingCount: 142 },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061935466', genre: 'Fiction', description: 'A story of racial injustice and the loss of innocence.', totalCopies: 4, available: 3, publishYear: 1960, pages: 281, avgRating: 4.8, ratingCount: 289 },
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', genre: 'Technology', description: 'A handbook of agile software craftsmanship.', totalCopies: 3, available: 2, publishYear: 2008, pages: 431, avgRating: 4.5, ratingCount: 98 },
  { title: 'Dune', author: 'Frank Herbert', isbn: '978-0441013593', genre: 'Science Fiction', description: 'An epic interstellar journey to the desert planet Arrakis.', totalCopies: 6, available: 6, publishYear: 1965, pages: 412, avgRating: 4.7, ratingCount: 201 },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '978-0135957059', genre: 'Technology', description: 'Your journey to mastery in software development.', totalCopies: 2, available: 1, publishYear: 2019, pages: 352, avgRating: 4.6, ratingCount: 77 },
  { title: '1984', author: 'George Orwell', isbn: '978-0451524935', genre: 'Dystopian', description: 'A chilling portrayal of a totalitarian society.', totalCopies: 5, available: 4, publishYear: 1949, pages: 328, avgRating: 4.7, ratingCount: 312 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0062316097', genre: 'Non-Fiction', description: 'A brief history of humankind from the Stone Age to the present.', totalCopies: 4, available: 4, publishYear: 2011, pages: 443, avgRating: 4.4, ratingCount: 188 },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0062315007', genre: 'Fiction', description: 'A magical story about following your dreams.', totalCopies: 3, available: 3, publishYear: 1988, pages: 197, avgRating: 4.3, ratingCount: 256 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bibliovault');
  await Book.deleteMany({});
  await User.deleteMany({});

  await Book.insertMany(BOOKS);

  // Create admin user
  await User.create({ name: 'Admin User', email: 'admin@bibliovault.com', password: 'Admin@123', role: 'admin' });
  await User.create({ name: 'Jane Reader', email: 'user@bibliovault.com', password: 'User@123', role: 'user' });

  console.log('✅ Database seeded!');
  console.log('   Admin: admin@bibliovault.com / Admin@123');
  console.log('   User:  user@bibliovault.com / User@123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
