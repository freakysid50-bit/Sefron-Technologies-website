const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const ExcelJS = require('exceljs');
require('dotenv').config();

// Keep public Firebase config in sync with .env for frontend Web SDK
try {
  const publicConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VITE_FIREBASE_APP_ID || ''
  };
  fs.writeFileSync(
    path.join(__dirname, 'public', 'firebase-config.json'),
    JSON.stringify(publicConfig, null, 2),
    'utf8'
  );
} catch (cfgErr) {
  console.warn('Note: could not write public/firebase-config.json:', cfgErr.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const EXCEL_FILE_PATH = path.join(DATA_DIR, 'submissions.xlsx');
const CSV_FILE_PATH = path.join(DATA_DIR, 'submissions.csv');

// In-memory rate limiter for contact submissions (max 5 requests per 10 minutes per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const contactRateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < RATE_LIMIT_WINDOW);
  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a few minutes before submitting again.'
    });
  }
  
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  next();
};

// Input sanitization helper
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // remove direct html tags
    .trim();
}

// Phone validator helper
function isValidPhone(phone) {
  // Allow international phone numbers with optional +, spaces, dashes, parentheses and at least 7 digits
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  const phoneRegex = /^(\+?\d{1,4})?(\d{7,15})$/;
  return phoneRegex.test(cleaned);
}

// Email validator helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Excel Append Helper using ExcelJS
async function appendToExcel({ timestamp, name, phone, email, message }) {
  const workbook = new ExcelJS.Workbook();
  let worksheet;

  if (fs.existsSync(EXCEL_FILE_PATH)) {
    try {
      await workbook.xlsx.readFile(EXCEL_FILE_PATH);
      worksheet = workbook.getWorksheet('Submissions') || workbook.worksheets[0];
    } catch (readErr) {
      console.error('Error reading existing Excel file, creating fresh worksheet:', readErr);
      worksheet = workbook.addWorksheet('Submissions');
    }
  } else {
    worksheet = workbook.addWorksheet('Submissions');
  }

  // If new or empty sheet, set up columns and styling
  if (!worksheet.columns || worksheet.rowCount <= 1) {
    worksheet.columns = [
      { header: 'Date & Time', key: 'timestamp', width: 24 },
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Phone Number', key: 'phone', width: 22 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Message', key: 'message', width: 50 }
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0077CC' } // Sefron Electric Blue
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 28;
  }

  // Add the new submission row
  const row = worksheet.addRow({
    timestamp,
    name,
    phone,
    email,
    message
  });

  // Apply clean row styling
  row.alignment = { vertical: 'top', wrapText: true };
  row.font = { name: 'Arial', size: 10 };
  row.commit();

  await workbook.xlsx.writeFile(EXCEL_FILE_PATH);

  // Also maintain CSV backup
  const csvRow = `"${timestamp.replace(/"/g, '""')}","${name.replace(/"/g, '""')}","${phone.replace(/"/g, '""')}","${email.replace(/"/g, '""')}","${message.replace(/"/g, '""')}"\n`;
  if (!fs.existsSync(CSV_FILE_PATH)) {
    fs.writeFileSync(CSV_FILE_PATH, `"Date & Time","Name","Phone Number","Email","Message"\n` + csvRow, 'utf8');
  } else {
    fs.appendFileSync(CSV_FILE_PATH, csvRow, 'utf8');
  }
}

// API: Contact Submission Endpoint
app.post('/api/contact', contactRateLimiter, async (req, res) => {
  try {
    const rawName = req.body.name;
    const rawPhone = req.body.phone;
    const rawEmail = req.body.email;
    const rawMessage = req.body.message;

    // Validation
    const name = sanitize(rawName);
    const phone = sanitize(rawPhone);
    const email = sanitize(rawEmail);
    const message = sanitize(rawMessage);

    const errors = {};

    if (!name || name.length < 2) {
      errors.name = 'Please enter your name (minimum 2 characters).';
    }

    if (!phone || !isValidPhone(phone)) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!email || !isValidEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!message || message.length < 10) {
      errors.message = 'Please tell us about your requirement (minimum 10 characters).';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please check the fields.',
        errors
      });
    }

    // Format current date & time
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');

    // Append to Excel
    await appendToExcel({
      timestamp: formattedDateTime,
      name,
      phone,
      email,
      message
    });

    // Optional server-side sync to Firestore collection contactMessages
    if (process.env.VITE_FIREBASE_PROJECT_ID && process.env.VITE_FIREBASE_API_KEY) {
      try {
        const { initializeApp, getApps } = require('firebase/app');
        const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
        const fbApp = getApps().length > 0 ? getApps()[0] : initializeApp({
          apiKey: process.env.VITE_FIREBASE_API_KEY,
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.VITE_FIREBASE_APP_ID
        });
        const fbDb = getFirestore(fbApp);
        await addDoc(collection(fbDb, 'contactMessages'), {
          name,
          phone,
          email,
          message,
          createdAt: serverTimestamp()
        });
        console.log(`[Firestore] Logged submission from "${name}" <${email}>`);
      } catch (fbErr) {
        console.warn('[Firestore Server Sync Note]:', fbErr.message);
      }
    }

    console.log(`[Contact Submission] Logged entry from "${name}" <${email}> at ${formattedDateTime}`);

    return res.status(200).json({
      success: true,
      message: 'Message Sent Successfully! Thank you for contacting Sefron Technologies. Our team will get back to you soon.'
    });
  } catch (err) {
    console.error('Error processing contact submission:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

// ==========================================================================
// FEATURED PROJECTS BACKEND & REDIRECT APIS
// ==========================================================================

const FEATURED_PROJECTS = [
  {
    id: 'sefron-store',
    title: 'Sefron Tech — Flagship Store',
    category: 'E-Commerce & Flagship Store',
    rating: '4.9 Verified',
    status: 'Live On Vercel',
    liveUrl: 'https://sefron-tech-07.vercel.app/',
    image: '/assets/projects/sefron_store.png',
    description: 'Modern, high-performance electronics e-commerce platform engineered with curated tech editions, real-time cart state management, category filtering, responsive checkout UI, and custom administrative dashboard integration.',
    techTags: ['React / Next.js', 'Vercel Cloud', 'E-Commerce UI', 'Cart Architecture', 'Payment Gateway']
  },
  {
    id: 'resq-drone',
    title: 'ResQ-X — AI Autonomous Drone Command',
    category: 'AI Drone Command & Tactical GIS',
    rating: '5.0 Critical Mission',
    status: 'Live On Vercel',
    liveUrl: 'https://res-q-drone.vercel.app/',
    image: '/assets/projects/resq_drone.png',
    description: 'Mission-critical tactical disaster intelligence and autonomous drone fleet command dashboard for Chennai Flood Response with real-time Edge AI survivor detection, LoRa mesh tracking, thermal verification, and automated rescue dispatch.',
    techTags: ['Next.js / React', 'Edge AI Detection', 'LoRa Mesh GIS', 'Fleet Telemetry', 'Vercel Cloud']
  },
  {
    id: 'furnicraft',
    title: 'FurniCraft — Studio & Atelier',
    category: 'Luxury Furniture · E-Commerce & ERP',
    rating: '5.0 Enterprise',
    status: 'Live On Vercel',
    liveUrl: 'https://furniture-shop-dun.vercel.app/',
    image: '/assets/projects/furnicraft.png',
    description: 'Bespoke luxury furniture atelier and showroom management ERP engineered with real-time sales telemetry, dynamic product catalog categorization, multi-tier inventory tracking, and seamless client order processing workflows.',
    techTags: ['React / Next.js', 'Vercel Cloud', 'Showroom ERP', 'Catalog Engine', 'Sales Analytics']
  },
  {
    id: 'sefron-house',
    title: 'Sefron House — Multi-Cuisine Restaurant',
    category: 'Multi-Cuisine Dining & Hospitality',
    rating: '5.0 Verified',
    status: 'Live On Vercel',
    liveUrl: 'https://sefron-house-75ra.vercel.app',
    adminCredentials: {
      userId: 'admin',
      pass: 'Rahul@2008'
    },
    image: '/assets/projects/sefron_house.png',
    description: 'Immersive multi-cuisine dining and hospitality portal featuring an extensive digital menu from authentic South Indian and North Indian classics to Italian and Asian delicacies, dynamic table reservations, and an administrative order management dashboard.',
    techTags: ['React / Next.js', 'Vercel Cloud', 'Multi-Cuisine Menu', 'Table Reservation', 'Admin Orders Portal']
  }
];

// API: Get all featured projects
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    total: FEATURED_PROJECTS.length,
    data: FEATURED_PROJECTS
  });
});

// API: Get a specific project by id
app.get('/api/projects/:id', (req, res) => {
  const project = FEATURED_PROJECTS.find(p => p.id === req.params.id);
  if (project) {
    res.json({ success: true, data: project });
  } else {
    res.status(404).json({ success: false, message: 'Project not found' });
  }
});

// API: Get public Firebase configuration for client Web SDK
app.get('/api/firebase-config', (req, res) => {
  let envConfig = {};
  try {
    const dotenv = require('dotenv');
    const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    envConfig = dotenv.parse(envFile);
  } catch (_) {}

  res.json({
    apiKey: process.env.VITE_FIREBASE_API_KEY || envConfig.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || envConfig.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || envConfig.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || envConfig.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VITE_FIREBASE_APP_ID || envConfig.VITE_FIREBASE_APP_ID || ''
  });
});

// Direct backend redirects for quick app access
app.get(['/app/store', '/projects/store', '/projects/sefron-store', '/live/store'], (req, res) => {
  res.redirect(302, 'https://sefron-tech-07.vercel.app/');
});

app.get(['/app/drone', '/app/resq-drone', '/projects/drone', '/projects/resq-drone', '/live/drone'], (req, res) => {
  res.redirect(302, 'https://res-q-drone.vercel.app/');
});

app.get(['/app/furnicraft', '/projects/furnicraft', '/live/furnicraft'], (req, res) => {
  res.redirect(302, 'https://furniture-shop-dun.vercel.app/');
});

app.get(['/app/house', '/app/restaurant', '/projects/sefron-house', '/live/sefron-house'], (req, res) => {
  res.redirect(302, 'https://sefron-house-75ra.vercel.app');
});

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Sefron Technologies Web Platform',
    projectsCount: FEATURED_PROJECTS.length,
    timestamp: new Date().toISOString()
  });
});

// API: Export submissions (for admin download)
app.get('/api/submissions/download', (req, res) => {
  if (fs.existsSync(EXCEL_FILE_PATH)) {
    res.download(EXCEL_FILE_PATH, 'Sefron_Contact_Submissions.xlsx');
  } else {
    res.status(404).json({ success: false, message: 'No submissions found yet.' });
  }
});

// Serve /src directory (for ES module firebase.js)
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA-style navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Sefron Technologies Server running on http://localhost:${PORT}`);
});
