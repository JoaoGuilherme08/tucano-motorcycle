// Função helper para obter a URL correta da imagem
// O backend já retorna URLs processadas em img.url

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function getImageUrl(urlOrFilename) {
  if (!urlOrFilename) return '/placeholder-moto.jpg';
  
  // Se já é uma URL completa (Cloudinary ou qualquer outra), retornar diretamente
  if (urlOrFilename.startsWith('http://') || urlOrFilename.startsWith('https://')) {
    return urlOrFilename;
  }
  
  // Se começa com /api/images, construir URL completa com base URL
  if (urlOrFilename.startsWith('/api/images')) {
    return `${API_BASE_URL}${urlOrFilename}`;
  }
  
  // Se começa com /uploads, construir URL completa
  if (urlOrFilename.startsWith('/uploads')) {
    return `${API_BASE_URL}${urlOrFilename}`;
  }
  
  // Fallback: assumir que é um filename local
  return `${API_BASE_URL}/uploads/${urlOrFilename}`;
}

