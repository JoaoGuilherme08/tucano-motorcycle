// Função helper para obter a URL correta da imagem
// Suporta tanto URLs do Cloudinary quanto URLs locais

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function getImageUrl(filename) {
  if (!filename) return '/placeholder-moto.jpg';
  
  // Se já é uma URL completa (Cloudinary), retornar diretamente
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Caso contrário, construir URL local
  return `${API_BASE_URL}/uploads/${filename}`;
}

