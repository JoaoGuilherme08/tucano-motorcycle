// Função helper para obter a URL correta da imagem
// O backend já retorna URLs processadas em img.url

// Obter a URL base da API (sem /api no final)
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Se termina com /api, remover
  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4);
  }
  // Se não tem /api, assumir que é a base
  return apiUrl.replace('/api', '');
};

const API_BASE_URL = getApiBaseUrl();

export function getImageUrl(urlOrFilename) {
  if (!urlOrFilename) return '/placeholder-moto.jpg';
  
  // Se já é uma URL completa (Cloudinary ou qualquer outra), retornar diretamente
  if (urlOrFilename.startsWith('http://') || urlOrFilename.startsWith('https://')) {
    return urlOrFilename;
  }
  
  // Se começa com /api/images, construir URL completa com base URL
  // A URL pode vir codificada (com %2F), o navegador vai decodificar automaticamente
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

