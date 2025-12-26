import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { isPostgres } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'veiculos_premium_secret_2024';

// URLs permitidas para CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(null, true); // Em produção, aceitar todas por enquanto
    }
  },
  credentials: true,
};

// Criar diretório de uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Criar tabelas (compatível com SQLite e PostgreSQL)
const initDatabase = async () => {
  if (isPostgres) {
    // PostgreSQL - usar tipos compatíveis
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(255) PRIMARY KEY,
        model VARCHAR(255) NOT NULL,
        brand VARCHAR(255) DEFAULT 'Harley-Davidson',
        category VARCHAR(255) DEFAULT 'custom',
        year INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'moto',
        featured INTEGER DEFAULT 0,
        sold INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicle_images (
        id VARCHAR(255) PRIMARY KEY,
        vehicle_id VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        is_primary INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      );
    `);
  } else {
    // SQLite
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        model TEXT NOT NULL,
        brand TEXT DEFAULT 'Harley-Davidson',
        category TEXT DEFAULT 'custom',
        year INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'moto',
        featured INTEGER DEFAULT 0,
        sold INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicle_images (
        id TEXT PRIMARY KEY,
        vehicle_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        is_primary INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      );
    `);
  }
};

// Inicializar banco de dados
await initDatabase();

// Migração: adicionar colunas brand, category e sold se não existirem (apenas SQLite)
if (!isPostgres) {
  try {
    db.exec(`ALTER TABLE vehicles ADD COLUMN brand TEXT DEFAULT 'Harley-Davidson'`);
  } catch (e) {
    // Coluna já existe
  }
  try {
    db.exec(`ALTER TABLE vehicles ADD COLUMN category TEXT DEFAULT 'custom'`);
  } catch (e) {
    // Coluna já existe
  }
  try {
    db.exec(`ALTER TABLE vehicles ADD COLUMN sold INTEGER DEFAULT 0`);
  } catch (e) {
    // Coluna já existe
  }
}

// Criar usuário admin padrão se não existir
const adminExists = await db.prepare('SELECT * FROM users WHERE username = ?').get('tucanoadmin');
if (!adminExists) {
  // Remover usuário admin antigo se existir
  await db.prepare('DELETE FROM users WHERE username = ?').run('admin');
  
  const hashedPassword = bcrypt.hashSync('tucano22131h', 10);
  await db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)').run(
    uuidv4(),
    'tucanoadmin',
    hashedPassword
  );
  console.log('Usuário admin criado com sucesso');
}

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Rotas de autenticação
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = await db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '24h'
  });
  
  res.json({ token, user: { id: user.id, username: user.username } });
});

app.get('/api/auth/verify', authenticate, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Rotas de veículos
app.get('/api/vehicles', async (req, res) => {
  const { model, brand, category, year, minPrice, maxPrice, minMileage, maxMileage, type, sort, featured, sold } = req.query;
  
  let query = 'SELECT * FROM vehicles WHERE 1=1';
  const params = [];
  
  // Filtrar por vendida ou não vendida
  console.log('GET /api/vehicles - sold query param:', sold, 'type:', typeof sold);
  if (sold !== undefined && sold !== null && sold !== '') {
    const soldParam = String(sold).toLowerCase().trim();
    if (soldParam === 'all') {
      // Quando 'all', mostrar todas (incluindo vendidas) - usado no admin
      // Não adiciona filtro de sold
      console.log('GET /api/vehicles - Showing all vehicles (including sold)');
    } else if (soldParam === 'true' || soldParam === '1') {
      // Quando solicitado explicitamente, mostrar apenas vendidas
      query += ' AND sold = 1';
      console.log('GET /api/vehicles - Filtering for sold vehicles (sold = 1)');
    } else if (soldParam === 'false' || soldParam === '0') {
      // Quando explicitamente false, excluir vendidas
      query += ' AND (sold = 0 OR sold IS NULL)';
      console.log('GET /api/vehicles - Filtering out sold vehicles (sold = 0 OR NULL)');
    } else {
      // Qualquer outro valor, excluir vendidas por padrão
      query += ' AND (sold = 0 OR sold IS NULL)';
      console.log('GET /api/vehicles - Unknown sold param, filtering out sold vehicles');
    }
  } else {
    // Por padrão (quando sold não é passado), excluir vendidas das buscas normais
    query += ' AND (sold = 0 OR sold IS NULL)';
    console.log('GET /api/vehicles - Default: Filtering out sold vehicles (sold = 0 OR NULL)');
  }
  
  if (model) {
    query += ' AND model LIKE ?';
    params.push(`%${model}%`);
  }
  if (brand) {
    query += ' AND brand = ?';
    params.push(brand);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (year) {
    query += ' AND year = ?';
    params.push(parseInt(year));
  }
  if (minPrice) {
    query += ' AND price >= ?';
    params.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(parseFloat(maxPrice));
  }
  if (minMileage) {
    query += ' AND mileage >= ?';
    params.push(parseInt(minMileage));
  }
  if (maxMileage) {
    query += ' AND mileage <= ?';
    params.push(parseInt(maxMileage));
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (featured === 'true') {
    query += ' AND featured = 1';
  }
  
  // Ordenação
  switch (sort) {
    case 'price_asc':
      query += ' ORDER BY price ASC';
      break;
    case 'price_desc':
      query += ' ORDER BY price DESC';
      break;
    case 'year_desc':
      query += ' ORDER BY year DESC';
      break;
    case 'year_asc':
      query += ' ORDER BY year ASC';
      break;
    default:
      query += ' ORDER BY created_at DESC';
  }
  
  const vehicles = await db.prepare(query).all(...params);
  
  // Buscar imagens para cada veículo
  const vehiclesWithImages = await Promise.all(vehicles.map(async (vehicle) => {
    const images = await db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_primary DESC').all(vehicle.id);
    return { ...vehicle, images };
  }));
  
  res.json(vehiclesWithImages);
});

app.get('/api/vehicles/:id', async (req, res) => {
  const vehicle = await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  
  if (!vehicle) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const images = await db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_primary DESC').all(vehicle.id);
  
  res.json({ ...vehicle, images });
});

app.post('/api/vehicles', authenticate, upload.array('images', 10), async (req, res) => {
  const { model, brand, category, year, mileage, price, description, type, featured, sold } = req.body;
  const vehicleId = uuidv4();
  
  console.log('POST /api/vehicles - sold value:', sold, 'type:', typeof sold, 'req.body:', JSON.stringify(req.body));
  // Verificar se sold é 'true' (string) ou true (boolean) ou '1' (string)
  // Converter para string e fazer lowercase para garantir compatibilidade
  const soldStr = String(sold || '').toLowerCase().trim();
  const soldValue = (soldStr === 'true' || soldStr === '1' || sold === true || sold === 1) ? 1 : 0;
  console.log('POST /api/vehicles - soldValue:', soldValue, 'from sold:', sold, 'soldStr:', soldStr);
  
  await db.prepare(`
    INSERT INTO vehicles (id, model, brand, category, year, mileage, price, description, type, featured, sold)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(vehicleId, model, brand || 'Harley-Davidson', category || 'custom', parseInt(year), parseInt(mileage), parseFloat(price), description, type || 'moto', featured === 'true' ? 1 : 0, soldValue);
  
  // Salvar imagens
  if (req.files && req.files.length > 0) {
    await Promise.all(req.files.map(async (file, index) => {
      await db.prepare(`
        INSERT INTO vehicle_images (id, vehicle_id, filename, is_primary)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), vehicleId, file.filename, index === 0 ? 1 : 0);
    }));
  }
  
  const vehicle = await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
  const images = await db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ?').all(vehicleId);
  
  res.status(201).json({ ...vehicle, images });
});

app.put('/api/vehicles/:id', authenticate, upload.array('images', 10), async (req, res) => {
  const { model, brand, category, year, mileage, price, description, type, featured, sold, removeImages } = req.body;
  
  console.log('PUT /api/vehicles/:id - sold value:', sold, 'type:', typeof sold, 'req.body:', JSON.stringify(req.body));
  
  const existing = await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  // Verificar se sold é 'true' (string) ou true (boolean) ou '1' (string)
  // Converter para string e fazer lowercase para garantir compatibilidade
  const soldStr = String(sold || '').toLowerCase().trim();
  const soldValue = (soldStr === 'true' || soldStr === '1' || sold === true || sold === 1) ? 1 : 0;
  console.log('PUT /api/vehicles/:id - soldValue:', soldValue, 'from sold:', sold, 'soldStr:', soldStr);
  
  await db.prepare(`
    UPDATE vehicles SET 
      model = ?, brand = ?, category = ?, year = ?, mileage = ?, price = ?, description = ?, type = ?, featured = ?, sold = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(model, brand || 'Harley-Davidson', category || 'custom', parseInt(year), parseInt(mileage), parseFloat(price), description, type || 'moto', featured === 'true' ? 1 : 0, soldValue, req.params.id);
  
  // Remover imagens selecionadas
  if (removeImages) {
    const imagesToRemove = JSON.parse(removeImages);
    await Promise.all(imagesToRemove.map(async (imageId) => {
      const image = await db.prepare('SELECT * FROM vehicle_images WHERE id = ?').get(imageId);
      if (image) {
        const imagePath = path.join(uploadsDir, image.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        await db.prepare('DELETE FROM vehicle_images WHERE id = ?').run(imageId);
      }
    }));
  }
  
  // Adicionar novas imagens
  if (req.files && req.files.length > 0) {
    const existingImages = await db.prepare('SELECT COUNT(*) as count FROM vehicle_images WHERE vehicle_id = ?').get(req.params.id);
    await Promise.all(req.files.map(async (file, index) => {
      await db.prepare(`
        INSERT INTO vehicle_images (id, vehicle_id, filename, is_primary)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), req.params.id, file.filename, existingImages.count === 0 && index === 0 ? 1 : 0);
    }));
  }
  
  const vehicle = await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  const images = await db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ?').all(req.params.id);
  
  res.json({ ...vehicle, images });
});

app.delete('/api/vehicles/:id', authenticate, async (req, res) => {
  const vehicle = await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  
  if (!vehicle) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  // Remover imagens do disco
  const images = await db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ?').all(req.params.id);
  images.forEach(image => {
    const imagePath = path.join(uploadsDir, image.filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });
  
  await db.prepare('DELETE FROM vehicle_images WHERE vehicle_id = ?').run(req.params.id);
  await db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
  
  res.json({ message: 'Veículo removido com sucesso' });
});

// Upload de imagens
app.post('/api/upload', authenticate, upload.array('images', 10), (req, res) => {
  const files = req.files.map(file => ({
    filename: file.filename,
    url: `/uploads/${file.filename}`
  }));
  res.json(files);
});

// Estatísticas para o painel admin
app.get('/api/stats', authenticate, async (req, res) => {
  const totalVehicles = await db.prepare('SELECT COUNT(*) as count FROM vehicles').get();
  const totalCars = await db.prepare('SELECT COUNT(*) as count FROM vehicles WHERE type = ?').get('car');
  const totalMotos = await db.prepare('SELECT COUNT(*) as count FROM vehicles WHERE type = ?').get('moto');
  const featuredCount = await db.prepare('SELECT COUNT(*) as count FROM vehicles WHERE featured = 1').get();
  
  res.json({ 
    totalVehicles: totalVehicles?.count || 0, 
    totalCars: totalCars?.count || 0, 
    totalMotos: totalMotos?.count || 0, 
    featuredCount: featuredCount?.count || 0 
  });
});

app.listen(PORT, () => {
  console.log(`🚗 Servidor rodando em http://localhost:${PORT}`);
});

