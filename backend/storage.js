// Sistema de armazenamento de imagens
// Usa Railway Storage (S3-compatible) como padrão

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Railway Storage
const RAILWAY_ENDPOINT = process.env.AWS_ENDPOINT_URL || process.env.RAILWAY_STORAGE_ENDPOINT || 'https://storage.railway.app';
const RAILWAY_BUCKET = process.env.AWS_S3_BUCKET_NAME || process.env.RAILWAY_STORAGE_BUCKET || 'structured-case-p5vwdqw2';
const RAILWAY_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || process.env.RAILWAY_STORAGE_ACCESS_KEY || 'tid_xAfmEsAWuBQqabLekIQwvKqAZx_GcrfNsTLLAThJSgNdWQwFzW';
const RAILWAY_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.RAILWAY_STORAGE_SECRET_KEY || 'tsec_OzPJpGZQAlPVYURC07up92YB33Ml2F0SUfyXlmP9ChB7SPRVkxkU5chXkaZoq5xDLAsH5U';
const RAILWAY_REGION = process.env.AWS_DEFAULT_REGION || process.env.RAILWAY_STORAGE_REGION || 'us-east-1';

const useRailwayStorage = RAILWAY_BUCKET && RAILWAY_ACCESS_KEY && RAILWAY_SECRET_KEY;

if (useRailwayStorage) {
  console.log('✅ Usando Railway Storage para armazenamento de imagens');
  console.log(`   Endpoint: ${RAILWAY_ENDPOINT}`);
  console.log(`   Bucket: ${RAILWAY_BUCKET}`);
}

// Configurar cliente S3
let s3Client = null;
if (useRailwayStorage) {
  s3Client = new S3Client({
    endpoint: RAILWAY_ENDPOINT,
    region: RAILWAY_REGION,
    credentials: {
      accessKeyId: RAILWAY_ACCESS_KEY,
      secretAccessKey: RAILWAY_SECRET_KEY,
    },
    forcePathStyle: true,
  });
}

// Configuração do Multer
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});

// Upload para Railway Storage
async function uploadToRailway(buffer, originalName) {
  const ext = path.extname(originalName).toLowerCase().replace('.', '') || 'jpg';
  const filename = `${uuidv4()}.${ext}`;
  const key = `tucano-motorcycle/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: RAILWAY_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  });

  await s3Client.send(command);
  
  // Salvar a key no banco, não a URL completa
  return {
    filename: key, // Salvar apenas a key
    url: key,
    railway: true
  };
}

export async function uploadImage(buffer, originalName) {
  if (useRailwayStorage) {
    return await uploadToRailway(buffer, originalName);
  } else {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${originalName}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    return {
      filename,
      url: `/uploads/${filename}`,
      railway: false
    };
  }
}

export async function uploadImages(files) {
  return Promise.all(files.map(file => uploadImage(file.buffer, file.originalname)));
}

export async function deleteImage(filename, isRailway = false) {
  if (!useRailwayStorage) {
    const filepath = path.join(uploadsDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    return;
  }

  // Extrair key
  let key = filename;
  if (filename.includes('storage.railway.app')) {
    try {
      const url = new URL(filename);
      const parts = url.pathname.split('/').filter(p => p);
      if (parts.length > 1) {
        key = parts.slice(1).join('/');
      }
    } catch (e) {
      const match = filename.match(/\/structured-case-p5vwdqw2\/(.+)/);
      if (match) key = match[1];
    }
  } else if (!filename.startsWith('http')) {
    // Já é uma key
    key = filename;
  }

  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: RAILWAY_BUCKET,
      Key: key,
    }));
  } catch (error) {
    console.error('Erro ao deletar:', error);
  }
}

// Extrair key do Railway Storage
function extractKey(filename) {
  if (!filename) return null;
  
  // Se já é uma key (não começa com http)
  if (!filename.startsWith('http')) {
    return filename.includes('/') ? filename : `tucano-motorcycle/${filename}`;
  }
  
  // Se é URL do Railway
  if (filename.includes('storage.railway.app')) {
    try {
      const url = new URL(filename);
      const parts = url.pathname.split('/').filter(p => p);
      if (parts.length > 1) {
        return parts.slice(1).join('/');
      }
    } catch (e) {
      const match = filename.match(/\/structured-case-p5vwdqw2\/(.+)/);
      if (match) return match[1];
      const match2 = filename.match(/storage\.railway\.app\/[^\/]+\/(.+)/);
      if (match2) return match2[1];
    }
  }
  
  return null;
}

// SEMPRE retornar URL do proxy para Railway Storage
export function getImageUrl(filename) {
  if (!filename) {
    console.log('⚠️ getImageUrl: filename vazio');
    return '/uploads/unknown';
  }
  
  console.log('🖼️ getImageUrl chamado com:', filename);
  
  // Cloudinary: retornar direto
  if (filename.includes('cloudinary.com')) {
    console.log('✅ Cloudinary detectado, retornando direto');
    return filename;
  }
  
  // Railway Storage: SEMPRE usar proxy
  const key = extractKey(filename);
  console.log('🔑 Key extraída:', key);
  
  if (key) {
    const proxyUrl = `images/${encodeURIComponent(key)}`;
    
    console.log('✅ URL proxy gerada:', proxyUrl);
    return proxyUrl;
  }
  
  console.log('⚠️ Key não encontrada, usando fallback local');
  // Local
  return `/uploads/${filename}`;
}

// Buscar imagem do Railway Storage
export async function getImageStream(key) {
  if (!useRailwayStorage || !s3Client) {
    throw new Error('Railway Storage não configurado');
  }
  
  const command = new GetObjectCommand({
    Bucket: RAILWAY_BUCKET,
    Key: key,
  });
  
  const response = await s3Client.send(command);
  return response.Body;
}
