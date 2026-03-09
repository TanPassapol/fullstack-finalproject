// ─── Mock Books ───────────────────────────────────────────────────────────────
export const MOCK_BOOKS = [
  { _id: '1',  title: 'The Great Gatsby',          author: 'F. Scott Fitzgerald', genre: 'Fiction',         description: 'A novel set in the Jazz Age on Long Island. A tragic love story and social critique of the American Dream.',              totalCopies: 5, available: 3, publishYear: 1925, pages: 180, avgRating: 4.2, ratingCount: 142 },
  { _id: '2',  title: 'To Kill a Mockingbird',     author: 'Harper Lee',          genre: 'Fiction',         description: 'A story of racial injustice and the loss of innocence seen through the eyes of young Scout Finch in Alabama.',          totalCopies: 4, available: 2, publishYear: 1960, pages: 281, avgRating: 4.8, ratingCount: 289 },
  { _id: '3',  title: 'Clean Code',                author: 'Robert C. Martin',    genre: 'Technology',      description: 'A handbook of agile software craftsmanship. Teaches you how to write better code.',                                      totalCopies: 3, available: 0, publishYear: 2008, pages: 431, avgRating: 4.5, ratingCount: 98  },
  { _id: '4',  title: 'Dune',                      author: 'Frank Herbert',       genre: 'Science Fiction', description: 'An epic interstellar journey to the desert planet Arrakis. A saga of politics, religion, and ecology.',                 totalCopies: 6, available: 5, publishYear: 1965, pages: 412, avgRating: 4.7, ratingCount: 201 },
  { _id: '5',  title: 'The Pragmatic Programmer',  author: 'Andrew Hunt',         genre: 'Technology',      description: 'Your journey to mastery in software development. Essential reading for every developer.',                               totalCopies: 2, available: 1, publishYear: 2019, pages: 352, avgRating: 4.6, ratingCount: 77  },
  { _id: '6',  title: '1984',                      author: 'George Orwell',       genre: 'Dystopian',       description: 'A chilling portrayal of a totalitarian society under constant surveillance.',                                           totalCopies: 5, available: 4, publishYear: 1949, pages: 328, avgRating: 4.7, ratingCount: 312 },
  { _id: '7',  title: 'Sapiens',                   author: 'Yuval Noah Harari',   genre: 'Non-Fiction',     description: 'A brief history of humankind from the Stone Age to the 21st century.',                                                 totalCopies: 4, available: 4, publishYear: 2011, pages: 443, avgRating: 4.4, ratingCount: 188 },
  { _id: '8',  title: 'The Alchemist',             author: 'Paulo Coelho',        genre: 'Fiction',         description: 'A magical story about following your dreams. A philosophical novel about self-discovery.',                              totalCopies: 3, available: 2, publishYear: 1988, pages: 197, avgRating: 4.3, ratingCount: 256 },
  { _id: '9',  title: 'Atomic Habits',             author: 'James Clear',         genre: 'Self-Help',       description: 'An easy & proven way to build good habits & break bad ones.',                                                          totalCopies: 4, available: 3, publishYear: 2018, pages: 319, avgRating: 4.6, ratingCount: 445 },
  { _id: '10', title: 'The Art of War',            author: 'Sun Tzu',             genre: 'Philosophy',      description: 'An ancient Chinese military treatise on strategy and tactics. Timeless wisdom for competition.',                         totalCopies: 5, available: 5, publishYear: -500, pages: 273, avgRating: 4.3, ratingCount: 178 },
  { _id: '11', title: 'Thinking, Fast and Slow',   author: 'Daniel Kahneman',     genre: 'Psychology',      description: 'A groundbreaking tour of the mind exposing two systems that drive the way we think.',                                   totalCopies: 3, available: 2, publishYear: 2011, pages: 499, avgRating: 4.5, ratingCount: 301 },
  { _id: '12', title: 'Design Patterns',           author: 'Gang of Four',        genre: 'Technology',      description: 'Elements of Reusable Object-Oriented Software. The classic reference for design patterns.',                             totalCopies: 2, available: 1, publishYear: 1994, pages: 395, avgRating: 4.4, ratingCount: 65  },
];

// ─── Mock Transactions ────────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS = [
  { _id: 't1', book: MOCK_BOOKS[0], status: 'borrowed', borrowedAt: new Date(Date.now() - 5 * 86400000),  dueDate: new Date(Date.now() + 9  * 86400000), renewCount: 0 },
  { _id: 't2', book: MOCK_BOOKS[1], status: 'borrowed', borrowedAt: new Date(Date.now() - 20 * 86400000), dueDate: new Date(Date.now() - 6  * 86400000), renewCount: 1 },
  { _id: 't3', book: MOCK_BOOKS[3], status: 'returned', borrowedAt: new Date(Date.now() - 30 * 86400000), dueDate: new Date(Date.now() - 16 * 86400000), returnedAt: new Date(Date.now() - 17 * 86400000), renewCount: 0 },
];

// ─── Mock Admin Transactions ──────────────────────────────────────────────────
export const MOCK_ADMIN_TRANSACTIONS = [
  ...MOCK_TRANSACTIONS,
  { _id: 't4', book: MOCK_BOOKS[4], user: { name: 'Alex C.',   email: 'alex@example.com'  }, status: 'borrowed', borrowedAt: new Date(Date.now() - 3  * 86400000), dueDate: new Date(Date.now() + 11 * 86400000), renewCount: 0 },
  { _id: 't5', book: MOCK_BOOKS[6], user: { name: 'Maria L.',  email: 'maria@example.com' }, status: 'overdue',  borrowedAt: new Date(Date.now() - 25 * 86400000), dueDate: new Date(Date.now() - 11 * 86400000), renewCount: 2 },
];

// ─── Mock Users ───────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { _id: 'u1', name: 'Admin User',  email: 'admin@bibliovault.com', role: 'admin',     isActive: true,  createdAt: new Date('2024-01-01') },
  { _id: 'u2', name: 'Jane Reader', email: 'user@bibliovault.com',  role: 'user',      isActive: true,  createdAt: new Date('2024-02-15') },
  { _id: 'u3', name: 'Alex Chen',   email: 'alex@example.com',      role: 'user',      isActive: true,  createdAt: new Date('2024-03-10') },
  { _id: 'u4', name: 'Maria Lopez', email: 'maria@example.com',     role: 'librarian', isActive: true,  createdAt: new Date('2024-01-20') },
  { _id: 'u5', name: 'Sam Wilson',  email: 'sam@example.com',       role: 'user',      isActive: false, createdAt: new Date('2024-04-01') },
];

// ─── Mock System Info ─────────────────────────────────────────────────────────
export const MOCK_SYSTEM = {
  hostname:   'bibliovault-server-01',
  platform:   'linux',
  arch:       'x64',
  uptime:     1024560,
  cpu: {
    model:    'Intel Core i7-12700K',
    cores:    8,
    avgUsage: '34.20',
    usage:    ['28.1','42.3','31.0','38.7','29.2','45.1','22.8','48.3'],
  },
  memory: {
    total:         17179869184,
    used:          8589934592,
    free:          8589934592,
    usagePercent: '50.00',
  },
  loadAvg:    [1.23, 1.45, 1.67],
  nodeVersion:'v20.10.0',
  pid:        12345,
};

// ─── Mock Admin Stats ─────────────────────────────────────────────────────────
export const MOCK_ADMIN_STATS = {
  totalBooks:   12,
  totalUsers:   48,
  activeBorrows: 23,
  overdueCount: 4,
};

// ─── Genre List ───────────────────────────────────────────────────────────────
export const GENRES = [
  'All', 'Fiction', 'Technology', 'Science Fiction',
  'Dystopian', 'Non-Fiction', 'Self-Help', 'Philosophy', 'Psychology',
];
