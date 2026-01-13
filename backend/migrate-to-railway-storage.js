// Script para migrar imagens do Cloudinary para Railway Storage
import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ Variáveis do Cloudinary não configuradas!');
  console.error('Configure: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Configuração do Railway Storage (S3-compatible)
const RAILWAY_ENDPOINT = 'https://storage.railway.app';
const RAILWAY_BUCKET = 'structured-case-p5vwdqw2';
const RAILWAY_ACCESS_KEY = 'tid_xAfmEsAWuBQqabLekIQwvKqAZx_GcrfNsTLLAThJSgNdWQwFzW';
const RAILWAY_SECRET_KEY = 'tsec_OzPJpGZQAlPVYURC07up92YB33Ml2F0SUfyXlmP9ChB7SPRVkxkU5chXkaZoq5xDLAsH5U';

const s3Client = new S3Client({
  endpoint: RAILWAY_ENDPOINT,
  region: 'us-east-1', // Railway não requer região específica, mas o SDK precisa de uma
  credentials: {
    accessKeyId: RAILWAY_ACCESS_KEY,
    secretAccessKey: RAILWAY_SECRET_KEY,
  },
  forcePathStyle: true, // Railway usa path-style
});

// Função para baixar uma imagem de uma URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Falha ao baixar imagem: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Função para fazer upload para Railway Storage
async function uploadToRailway(buffer, key, contentType) {
  try {
    const command = new PutObjectCommand({
      Bucket: RAILWAY_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return `${RAILWAY_ENDPOINT}/${RAILWAY_BUCKET}/${key}`;
  } catch (error) {
    console.error(`Erro ao fazer upload de ${key}:`, error);
    throw error;
  }
}

// Função para verificar se o arquivo já existe no Railway
async function fileExists(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: RAILWAY_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

// Função para listar todas as imagens do Cloudinary
async function listCloudinaryImages() {
  console.log('📋 Listando imagens do Cloudinary...');
  
  let allResources = [];
  let nextCursor = null;

  do {
    const result = await cloudinary.search
      .expression('folder:tucano-motorcycle/*')
      .max_results(500)
      .next_cursor(nextCursor)
      .execute();

    allResources = allResources.concat(result.resources);
    nextCursor = result.next_cursor;
    
    console.log(`   Encontradas ${allResources.length} imagens até agora...`);
  } while (nextCursor);

  console.log(`✅ Total de ${allResources.length} imagens encontradas no Cloudinary\n`);
  return allResources;
}

// Função para migrar uma imagem
async function migrateImage(cloudinaryResource) {
  const publicId = cloudinaryResource.public_id;
  const secureUrl = cloudinaryResource.secure_url;
  const format = cloudinaryResource.format || 'jpg';
  
  // Criar key para Railway Storage (manter estrutura similar)
  const key = `tucano-motorcycle/${publicId.replace('tucano-motorcycle/', '')}.${format}`;
  
  // Verificar se já existe
  const exists = await fileExists(key);
  if (exists) {
    console.log(`   ⏭️  Já existe: ${key}`);
    return `${RAILWAY_ENDPOINT}/${RAILWAY_BUCKET}/${key}`;
  }

  // Baixar imagem do Cloudinary
  console.log(`   📥 Baixando: ${secureUrl}`);
  const imageBuffer = await downloadImage(secureUrl);
  
  // Fazer upload para Railway
  console.log(`   📤 Fazendo upload: ${key}`);
  const contentType = `image/${format === 'jpg' ? 'jpeg' : format}`;
  const railwayUrl = await uploadToRailway(imageBuffer, key, contentType);
  
  console.log(`   ✅ Migrada: ${railwayUrl}`);
  return railwayUrl;
}

// Função principal de migração
async function migrateAllImages() {
  console.log('🚀 Iniciando migração do Cloudinary para Railway Storage...\n');

  try {
    // Listar todas as imagens do Cloudinary
    const cloudinaryImages = await listCloudinaryImages();

    if (cloudinaryImages.length === 0) {
      console.log('⚠️  Nenhuma imagem encontrada no Cloudinary');
      return;
    }

    // Criar mapa de URLs antigas para novas
    const urlMap = new Map();
    let successCount = 0;
    let errorCount = 0;

    // Migrar cada imagem
    for (let i = 0; i < cloudinaryImages.length; i++) {
      const resource = cloudinaryImages[i];
      console.log(`\n[${i + 1}/${cloudinaryImages.length}] Processando: ${resource.public_id}`);
      
      try {
        const railwayUrl = await migrateImage(resource);
        urlMap.set(resource.secure_url, railwayUrl);
        successCount++;
        
        // Pequeno delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   ❌ Erro ao migrar ${resource.public_id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumo da migração:`);
    console.log(`   ✅ Sucesso: ${successCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📋 Total: ${cloudinaryImages.length}\n`);

    // Salvar mapeamento de URLs
    if (urlMap.size > 0) {
      console.log('💾 Salvando mapeamento de URLs...');
      await saveUrlMapping(urlMap);
      console.log('✅ Mapeamento salvo!\n');
    }

    console.log('🎉 Migração concluída!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

// Função para salvar mapeamento de URLs (para atualizar banco depois)
async function saveUrlMapping(urlMap) {
  try {
    const mappingFile = path.join(__dirname, 'url-mapping.json');
    const mapping = Array.from(urlMap.entries()).map(([oldUrl, newUrl]) => ({
      oldUrl,
      newUrl
    }));
    
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log(`\n📄 Mapeamento salvo em: ${mappingFile}`);
    console.log(`   Total de ${mapping.length} URLs mapeadas`);
    
    // Gerar também um arquivo SQL para atualização
    const sqlFile = path.join(__dirname, 'update-urls.sql');
    const sqlStatements = mapping.map(({ oldUrl, newUrl }) => {
      // Escapar aspas simples para SQL
      const escapedOld = oldUrl.replace(/'/g, "''");
      const escapedNew = newUrl.replace(/'/g, "''");
      return `UPDATE vehicle_images SET filename = '${escapedNew}' WHERE filename = '${escapedOld}';`;
    }).join('\n');
    
    fs.writeFileSync(sqlFile, sqlStatements);
    console.log(`📄 Arquivo SQL gerado em: ${sqlFile}`);
    console.log(`   Execute este SQL no seu banco de dados para atualizar as URLs`);
  } catch (error) {
    console.error('❌ Erro ao salvar mapeamento:', error);
    throw error;
  }
}

// Executar migração
migrateAllImages()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falhou:', error);
    process.exit(1);
  });

