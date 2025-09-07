const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const paintOrderRoutes = require('./routes/paint-orders');
const serviceRequestRoutes = require('./routes/service-requests');
const paintTypesRoutes = require('./routes/paint-types');
const machinesRoutes = require('./routes/machines');

// Auth middleware
const { authenticateToken, requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
    }
  }
}));

// Rate limiting for general API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // increased limit for mobile auto-refresh
  message: {
    success: false,
    message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Body parser middleware with increased limit for image uploads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/paint-orders', paintOrderRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/paint-types', paintTypesRoutes);
app.use('/api/machines', machinesRoutes);

// Serve different interfaces based on route
// Admin panel
// Admin panel - herkese açık
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Mobile user interface
app.get('/mobile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mobile', 'index.html'));
});

// Serve technical mobile interface
app.get('/technical', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'technical', 'index.html'));
});

// Serve delivery mobile interface
app.get('/delivery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'delivery', 'index.html'));
});

// Default route - redirect to appropriate interface
app.get('/', (req, res) => {
  const userAgent = req.get('User-Agent');
  if (userAgent && (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone'))) {
    res.redirect('/mobile');
  } else {
    res.redirect('/admin');
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Sayfa bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası oluştu' });
});

// Initialize database and start server
const db = require('./config/database');
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
    console.log(`📱 Mobil arayüz: http://localhost:${PORT}/mobile`);
    console.log(`⚙️  Admin paneli: http://localhost:${PORT}/admin`);
  });
}).catch(err => {
  console.error('Veritabanı başlatma hatası:', err);
  process.exit(1);
});

module.exports = app;