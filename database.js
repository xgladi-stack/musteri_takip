const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
let db;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
        reject(err);
      } else {
        console.log('✅ SQLite veritabanına bağlanıldı');
        createTables().then(resolve).catch(reject);
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    // Users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        full_name TEXT,
        phone TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Customers table
    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        company TEXT,
        notes TEXT,
        username TEXT UNIQUE,
        password TEXT,
        status TEXT DEFAULT 'active',
        assigned_user_id INTEGER,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_user_id) REFERENCES users (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `;

    // Customer interactions table
    const createInteractionsTable = `
      CREATE TABLE IF NOT EXISTS customer_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        interaction_type TEXT NOT NULL,
        description TEXT,
        interaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        follow_up_date DATETIME,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    // Paint orders table
    const createPaintOrdersTable = `
      CREATE TABLE IF NOT EXISTS paint_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        paint_brand TEXT,
        paint_type TEXT NOT NULL,
        paint_color TEXT,
        quantity REAL NOT NULL,
        unit TEXT DEFAULT 'kg',
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        delivery_date DATETIME,
        status TEXT DEFAULT 'pending_approval',
        approval_status TEXT DEFAULT 'pending',
        approved_by INTEGER,
        approved_at DATETIME,
        assigned_to INTEGER,
        assigned_at DATETIME,
        notes TEXT,
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (approved_by) REFERENCES users (id),
        FOREIGN KEY (assigned_to) REFERENCES users (id)
      )
    `;

    // Add missing columns to paint_orders table
    const addPaintOrdersColumns = () => {
      // Add paint_brand column
      db.run('ALTER TABLE paint_orders ADD COLUMN paint_brand TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding paint_brand column:', err);
        } else if (!err) {
          console.log('✅ Paint_brand column added to paint_orders table');
        }
      });
      
      // Add approval_status column
      db.run('ALTER TABLE paint_orders ADD COLUMN approval_status TEXT DEFAULT "pending"', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding approval_status column:', err);
        } else if (!err) {
          console.log('✅ Approval_status column added to paint_orders table');
        }
      });
      
      // Add approved_by column
      db.run('ALTER TABLE paint_orders ADD COLUMN approved_by INTEGER', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding approved_by column:', err);
        } else if (!err) {
          console.log('✅ Approved_by column added to paint_orders table');
        }
      });
      
      // Add approved_at column
      db.run('ALTER TABLE paint_orders ADD COLUMN approved_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding approved_at column:', err);
        } else if (!err) {
          console.log('✅ Approved_at column added to paint_orders table');
        }
      });
      
      // Add assigned_to column
      db.run('ALTER TABLE paint_orders ADD COLUMN assigned_to INTEGER', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding assigned_to column:', err);
        } else if (!err) {
          console.log('✅ Assigned_to column added to paint_orders table');
        }
      });
      
      // Add assigned_at column
      db.run('ALTER TABLE paint_orders ADD COLUMN assigned_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding assigned_at column:', err);
        } else if (!err) {
          console.log('✅ Assigned_at column added to paint_orders table');
        }
      });
      
      // Add admin_notes column
      db.run('ALTER TABLE paint_orders ADD COLUMN admin_notes TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding admin_notes column:', err);
        } else if (!err) {
          console.log('✅ Admin_notes column added to paint_orders table');
        }
      });
      
      // Add payment_type column
      db.run('ALTER TABLE paint_orders ADD COLUMN payment_type TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding payment_type column:', err);
        } else if (!err) {
          console.log('✅ Payment_type column added to paint_orders table');
        }
      });
    };

    // Add missing columns to service_requests table
    const addServiceRequestsColumns = () => {
      // Add approval_status column
      db.run('ALTER TABLE service_requests ADD COLUMN approval_status TEXT DEFAULT "pending"', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding approval_status column to service_requests:', err);
        } else if (!err) {
          console.log('✅ Approval_status column added to service_requests table');
        }
      });
      
      // Add approved_by column
      db.run('ALTER TABLE service_requests ADD COLUMN approved_by INTEGER', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding approved_by column to service_requests:', err);
        } else if (!err) {
          console.log('✅ Approved_by column added to service_requests table');
        }
      });
      
      // Add approved_at column
      db.run('ALTER TABLE service_requests ADD COLUMN approved_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding approved_at column to service_requests:', err);
        } else if (!err) {
          console.log('✅ Approved_at column added to service_requests table');
        }
      });
      
      // Add assigned_to column
      db.run('ALTER TABLE service_requests ADD COLUMN assigned_to INTEGER', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding assigned_to column to service_requests:', err);
        } else if (!err) {
          console.log('✅ Assigned_to column added to service_requests table');
        }
      });
      
      // Add assigned_at column
      db.run('ALTER TABLE service_requests ADD COLUMN assigned_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding assigned_at column to service_requests:', err);
        } else if (!err) {
          console.log('✅ Assigned_at column added to service_requests table');
        }
      });
      
      // Add technician_notes column
      db.run('ALTER TABLE service_requests ADD COLUMN technician_notes TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding technician_notes column to service_requests:', err);
        } else if (!err) {
          console.log('✅ Technician_notes column added to service_requests table');
        }
      });
      
      // Add admin_notes column
      db.run('ALTER TABLE service_requests ADD COLUMN admin_notes TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding admin_notes column to service_requests:', err);
        } else if (!err) {
          console.log('✅ Admin_notes column added to service_requests table');
        }
      });
    };

    // Service requests table
    const createServiceRequestsTable = `
      CREATE TABLE IF NOT EXISTS service_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        service_type TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        scheduled_date DATETIME,
        completion_date DATETIME,
        status TEXT DEFAULT 'pending_approval',
        approval_status TEXT DEFAULT 'pending',
        approved_by INTEGER,
        approved_at DATETIME,
        assigned_to INTEGER,
        assigned_at DATETIME,
        technician_notes TEXT,
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (approved_by) REFERENCES users (id),
        FOREIGN KEY (assigned_to) REFERENCES users (id)
      )
    `;

    // Paint types table
    const createPaintTypesTable = `
      CREATE TABLE IF NOT EXISTS paint_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand TEXT NOT NULL,
        type TEXT NOT NULL,
        color TEXT NOT NULL,
        unit TEXT DEFAULT 'litre',
        price DECIMAL(10,2),
        stock_quantity INTEGER DEFAULT 0,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `;

    // Machines table
    const createMachinesTable = `
      CREATE TABLE IF NOT EXISTS machines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_type TEXT NOT NULL,
        machine_name TEXT NOT NULL,
        brand TEXT NOT NULL,
        model TEXT,
        category TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'available',
        production_year INTEGER,
        machine_condition TEXT,
        description TEXT,
        images TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `;

    // Sessions table for JWT token management
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    db.serialize(() => {
      db.run(createUsersTable);
      db.run(createCustomersTable);
      
      // Add auth columns to existing customers table if they don't exist
      db.run(`ALTER TABLE customers ADD COLUMN username TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding username column:', err);
        } else {
          console.log('✅ Username column added to customers table');
        }
      });
      db.run(`ALTER TABLE customers ADD COLUMN password TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding password column:', err);
        } else {
          console.log('✅ Password column added to customers table');
        }
      });
      
      db.run(createInteractionsTable);
      db.run(createPaintOrdersTable);
      addPaintOrdersColumns(); // Add missing columns to existing table
      db.run(createServiceRequestsTable);
      addServiceRequestsColumns(); // Add missing columns to existing table
      db.run(createPaintTypesTable);
      db.run(createMachinesTable);
      db.run(createSessionsTable, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Veritabanı tabloları oluşturuldu');
          createDefaultAdmin().then(resolve).catch(reject);
        }
      });
    });
  });
};

const createDefaultAdmin = async () => {
  return new Promise((resolve, reject) => {
    // Check if admin user exists
    db.get('SELECT id FROM users WHERE role = "admin" LIMIT 1', (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        // Create default admin user
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        const insertAdmin = `
          INSERT INTO users (username, email, password, role, full_name, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(insertAdmin, [
          'admin',
          'admin@example.com',
          hashedPassword,
          'admin',
          'Sistem Yöneticisi',
          1
        ], (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Varsayılan admin kullanıcısı oluşturuldu (admin/admin123)');
            resolve();
          }
        });
      } else {
        console.log('✅ Admin kullanıcısı mevcut');
        resolve();
      }
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('Veritabanı başlatılmamış');
  }
  return db;
};

const close = () => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Veritabanı kapatma hatası:', err.message);
        } else {
          console.log('Veritabanı bağlantısı kapatıldı');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  init,
  getDb,
  close
};