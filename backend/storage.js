// Sistema de armazenamento de imagens
// Usa Railway Storage (S3-compatible) como padrão

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Railway Storage (S3-compatible)
const RAILWAY_ENDPOINT = process.env.RAILWAY_STORAGE_ENDPOINT || 'https://storage.railway.app';
const RAILWAY_BUCKET = process.env.RAILWAY_STORAGE_BUCKET || 'structured-case-p5vwdqw2';
const RAILWAY_ACCESS_KEY = process.env.RAILWAY_STORAGE_ACCESS_KEY || 'tid_xAfmEsAWuBQqabLekIQwvKqAZx_GcrfNsTLLAThJSgNdWQwFzW';
const RAILWAY_SECRET_KEY = process.env.RAILWAY_STORAGE_SECRET_KEY || 'tsec_OzPJpGZQAlPVYURC07up92YB33Ml2F0SUfyXlmP9ChB7SPRVkxkU5chXkaZoq5xDLAsH5U';

const useRailwayStorage = RAILWAY_BUCKET && RAILWAY_ACCESS_KEY && RAILWAY_SECRET_KEY;

if (useRailwayStorage) {
  console.log('✅ Usando Railway Storage para armazenamento de imagens');
  console.log(`   Endpoint: ${RAILWAY_ENDPOINT}`);
  console.log(`   Bucket: ${RAILWAY_BUCKET}`);
} else {
  console.log('⚠️  Railway Storage não configurado - usando armazenamento local (não persistente)');
  console.log('📝 Configure RAILWAY_STORAGE_BUCKET, RAILWAY_STORAGE_ACCESS_KEY e RAILWAY_STORAGE_SECRET_KEY');
}

// Configurar cliente S3 para Railway Storage
let s3Client = null;
if (useRailwayStorage) {
  s3Client = new S3Client({
    endpoint: RAILWAY_ENDPOINT,
    region: 'us-east-1',
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

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
    }
  },
});

// Função para fazer upload de uma imagem para Railway Storage
async function uploadToRailway(buffer, originalName) {
  const ext = path.extname(originalName).toLowerCase().replace('.', '') || 'jpg';
  const filename = `${uuidv4()}.${ext}`;
  const key = `tucano-motorcycle/${filename}`;
  
  const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  
  const command = new PutObjectCommand({
    Bucket: RAILWAY_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  
  const url = `${RAILWAY_ENDPOINT}/${RAILWAY_BUCKET}/${key}`;
  
  return {
    filename: url,
    url: url,
    railway: true
  };
}

// Função para fazer upload de uma imagem
export async function uploadImage(buffer, originalName) {
  if (useRailwayStorage) {
    return await uploadToRailway(buffer, originalName);
  } else {
    // Fallback para armazenamento local (não persistente)
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

// Função para fazer upload de múltiplas imagens
export async function uploadImages(files) {
  return Promise.all(
    files.map(file => uploadImage(file.buffer, file.originalname))
  );
}

// Função para deletar uma imagem
export async function deleteImage(filename, isRailway = false) {
  // Detectar automaticamente se é Railway Storage pela URL
  const isRailwayUrl = filename.includes('storage.railway.app') || filename.startsWith(RAILWAY_ENDPOINT);
  const shouldUseRailway = (isRailway || isRailwayUrl) && useRailwayStorage;
  
  if (shouldUseRailway) {
    try {
      // Extrair key da URL do Railway Storage
      let key = filename;
      if (filename.startsWith(RAILWAY_ENDPOINT)) {
        // URL completa: https://storage.railway.app/bucket/key
        const urlParts = filename.replace(`${RAILWAY_ENDPOINT}/`, '').split('/');
        if (urlParts.length > 1) {
          key = urlParts.slice(1).join('/'); // Remover bucket name
        }
      } else if (filename.startsWith('http')) {
        // URL completa de outro formato
        const urlParts = new URL(filename).pathname.split('/').filter(p => p);
        if (urlParts.length > 1) {
          key = urlParts.slice(1).join('/'); // Remover bucket name
        }
      }
      
      const command = new DeleteObjectCommand({
        Bucket: RAILWAY_BUCKET,
        Key: key,
      });
      
      await s3Client.send(command);
      console.log('✅ Imagem deletada do Railway Storage:', key);
    } catch (error) {
      console.error('Erro ao deletar imagem do Railway Storage:', error);
      // Não falhar se a imagem não existir
    }
  } else {
    // Deletar do armazenamento local
    const filepath = path.join(uploadsDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log('✅ Imagem deletada localmente:', filename);
    }
  }
}

// Função para obter a URL da imagem
export function getImageUrl(filename, isRailway = false) {
  // Se já é uma URL completa, retornar diretamente
  if (filename && filename.startsWith('http')) {
    return filename;
  }
  
  // Detectar automaticamente se é Railway Storage pela URL antiga do Cloudinary
  const isCloudinaryUrl = filename && filename.includes('cloudinary.com');
  const isRailwayUrl = filename && filename.includes('storage.railway.app');
  
  // Se for URL do Cloudinary, manter como está (para compatibilidade com imagens antigas)
  if (isCloudinaryUrl) {
    return filename;
  }
  
  // Se for Railway Storage ou se useRailwayStorage estiver ativo
  if ((isRailway || isRailwayUrl || useRailwayStorage) && !isCloudinaryUrl) {
    // Construir URL do Railway Storage
    const key = filename && filename.includes('/') ? filename : `tucano-motorcycle/${filename || 'unknown'}`;
    return `${RAILWAY_ENDPOINT}/${RAILWAY_BUCKET}/${key}`;
  }
  
  // Fallback para local
  return `/uploads/${filename || 'unknown'}`;
}
