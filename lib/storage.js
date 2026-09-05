import clientPromise from './mongodb';
import fs from 'fs';
import path from 'path';

const DB_NAME = 'humblbar';
const RESPONSES_COLLECTION = 'quiz_responses';
const CONTACT_COLLECTION = 'contact_submissions';

// Path for local disk persistent backup
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory and file exist
function getLocalData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading local leads file:', err);
    return [];
  }
}

function saveLocalData(items) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local leads file:', err);
  }
}

export async function getDb() {
  if (clientPromise) {
    try {
      const client = await clientPromise;
      return client.db(DB_NAME);
    } catch (e) {
      console.warn('MongoDB Atlas connection failed or not configured, using local persistent storage:', e.message);
      return null;
    }
  }
  return null;
}

export async function saveQuizSubmission(data) {
  const entry = {
    ...data,
    type: 'quiz',
    mealsPledged: 1,
    createdAt: new Date().toISOString()
  };

  const db = await getDb();

  if (db) {
    try {
      const result = await db.collection(RESPONSES_COLLECTION).insertOne(entry);
      const saved = { ...entry, _id: result.insertedId.toString() };
      // Also write local backup
      const local = getLocalData();
      local.unshift(saved);
      saveLocalData(local);
      return saved;
    } catch (e) {
      console.error('MongoDB insert error:', e);
    }
  }

  // Local persistent save
  const localEntry = {
    ...entry,
    _id: 'lead-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900)
  };
  const localItems = getLocalData();
  localItems.unshift(localEntry);
  saveLocalData(localItems);
  return localEntry;
}

export async function saveContactSubmission(data) {
  const entry = {
    ...data,
    type: 'contact',
    createdAt: new Date().toISOString()
  };

  const db = await getDb();

  if (db) {
    try {
      const result = await db.collection(CONTACT_COLLECTION).insertOne(entry);
      const saved = { ...entry, _id: result.insertedId.toString() };
      const local = getLocalData();
      local.unshift(saved);
      saveLocalData(local);
      return saved;
    } catch (e) {
      console.error('MongoDB insert error:', e);
    }
  }

  const localEntry = {
    ...entry,
    _id: 'inquiry-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900)
  };
  const localItems = getLocalData();
  localItems.unshift(localEntry);
  saveLocalData(localItems);
  return localEntry;
}

export async function getAllSubmissions({ search = '', type = 'all', archetype = 'all' } = {}) {
  const db = await getDb();
  let items = [];

  if (db) {
    try {
      const quizItems = await db.collection(RESPONSES_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
      const contactItems = await db.collection(CONTACT_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
      items = [
        ...quizItems.map(i => ({ ...i, _id: i._id.toString() })),
        ...contactItems.map(i => ({ ...i, _id: i._id.toString() }))
      ];
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.warn('Error fetching from Mongo, fallback to local storage:', err);
      items = getLocalData();
    }
  } else {
    items = getLocalData();
  }

  // Filter by type
  if (type !== 'all') {
    items = items.filter(item => item.type === type);
  }

  // Filter by archetype
  if (archetype !== 'all') {
    items = items.filter(item => item.archetype && item.archetype.id === archetype);
  }

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    items = items.filter(item => {
      return (
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        (item.passId && item.passId.toLowerCase().includes(q)) ||
        (item.subject && item.subject.toLowerCase().includes(q)) ||
        (item.archetype && item.archetype.title.toLowerCase().includes(q))
      );
    });
  }

  return items;
}

export async function deleteSubmissionById(id) {
  const db = await getDb();
  if (db) {
    try {
      const { ObjectId } = await import('mongodb');
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch {
        query = { _id: id };
      }
      await db.collection(RESPONSES_COLLECTION).deleteOne(query);
      await db.collection(CONTACT_COLLECTION).deleteOne(query);
    } catch (e) {
      console.error('Mongo delete error:', e);
    }
  }

  // Delete from local file storage
  const localItems = getLocalData().filter(item => item._id !== id);
  saveLocalData(localItems);
  return true;
}

export async function getDashboardMetrics() {
  const all = await getAllSubmissions();
  const quizLeads = all.filter(i => i.type === 'quiz');
  const contactLeads = all.filter(i => i.type === 'contact');

  const totalMealsPledged = quizLeads.length;
  const totalWaitlistCount = quizLeads.length;

  // Archetype distribution
  const archetypesCount = {
    'power-strategist': 0,
    'clean-purist': 0,
    'endurance-beast': 0,
    'mindful-connoisseur': 0
  };

  quizLeads.forEach(q => {
    if (q.archetype && archetypesCount[q.archetype.id] !== undefined) {
      archetypesCount[q.archetype.id]++;
    }
  });

  return {
    totalWaitlistCount,
    totalMealsPledged,
    totalQuizResponses: quizLeads.length,
    totalContacts: contactLeads.length,
    archetypesCount,
    recentSubmissions: all.slice(0, 10),
    isMongoConnected: !!clientPromise
  };
}
