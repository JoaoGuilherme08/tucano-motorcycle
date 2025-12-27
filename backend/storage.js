// Sistema de armazenamento de imagens
// Suporta Cloudinary (recomendado) ou armazenamento local (desenvolvimento)

import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar Cloudinary se as variáveis de ambiente estiverem disponíveis
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Usando Cloudinary para armazenamento de imagens');
} else {
  console.log('⚠️  Cloudinary não configurado - usando armazenamento local (não persistente)');
  console.log('📝 Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET para persistência');
}

// Configuração do Multer
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage(); // Usar memória para depois enviar ao Cloudinary

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

// Função para fazer upload de uma imagem
export async function uploadImage(buffer, originalName) {
  if (useCloudinary) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'tucano-motorcycle',
          resource_type: 'image',
          format: 'auto',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Erro ao fazer upload para Cloudinary:', error);
            reject(error);
          } else {
            // Salvar a URL completa no filename para facilitar a identificação
            resolve({
              filename: result.secure_url, // Salvar URL completa
              url: result.secure_url,
              cloudinary: true
            });
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } else {
    // Fallback para armazenamento local (não persistente)
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${originalName}`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    return {
      filename,
      url: `/uploads/${filename}`,
      cloudinary: false
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
export async function deleteImage(filename, isCloudinary = false) {
  if (isCloudinary && useCloudinary) {
    try {
      // Se for uma URL completa do Cloudinary, extrair o public_id
      let publicId = filename;
      if (filename.startsWith('http')) {
        // Extrair public_id da URL do Cloudinary
        // Exemplo: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/tucano-motorcycle/xyz.jpg
        const urlParts = filename.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
          // Pegar tudo após 'upload/v...' ou 'upload/'
          const afterUpload = urlParts.slice(uploadIndex + 2).join('/');
          // Remover extensão se houver
          publicId = afterUpload.replace(/\.[^/.]+$/, '');
        }
      } else if (!filename.includes('/')) {
        // Se for só o nome, adicionar o folder
        publicId = `tucano-motorcycle/${filename}`;
      }
      
      await cloudinary.uploader.destroy(publicId);
      console.log('✅ Imagem deletada do Cloudinary:', publicId);
    } catch (error) {
      console.error('Erro ao deletar imagem do Cloudinary:', error);
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
export function getImageUrl(filename, isCloudinary = false) {
  if (isCloudinary && useCloudinary) {
    // Se já é uma URL completa, retornar
    if (filename.startsWith('http')) {
      return filename;
    }
    // Construir URL do Cloudinary
    const publicId = filename.includes('/') ? filename : `tucano-motorcycle/${filename}`;
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    });
  } else {
    return `/uploads/${filename}`;
  }
}

