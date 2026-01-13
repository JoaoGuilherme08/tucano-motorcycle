# 🚀 Migração para Railway Storage

Este guia explica como migrar as imagens do Cloudinary para o Railway Storage.

## 📋 Pré-requisitos

1. **Variáveis do Cloudinary configuradas** (para listar as imagens existentes):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

2. **Credenciais do Railway Storage** (já configuradas no código):
   - Endpoint: `https://storage.railway.app`
   - Bucket: `structured-case-p5vwdqw2`
   - Access Key e Secret Key (já configuradas no código)

## 🔄 Como Executar a Migração

### Passo 1: Configurar Variáveis de Ambiente

Certifique-se de que as variáveis do Cloudinary estão configuradas no ambiente onde você vai executar o script:

```bash
export CLOUDINARY_CLOUD_NAME="seu-cloud-name"
export CLOUDINARY_API_KEY="sua-api-key"
export CLOUDINARY_API_SECRET="seu-api-secret"
```

### Passo 2: Executar o Script de Migração

```bash
cd backend
npm run migrate:storage
```

Ou diretamente:

```bash
cd backend
node migrate-to-railway-storage.js
```

## 📊 O que o Script Faz

1. **Lista todas as imagens** do Cloudinary na pasta `tucano-motorcycle`
2. **Baixa cada imagem** do Cloudinary
3. **Faz upload** para o Railway Storage
4. **Gera arquivos de mapeamento**:
   - `url-mapping.json` - Mapeamento JSON das URLs antigas para novas
   - `update-urls.sql` - Arquivo SQL pronto para executar no banco de dados
5. **Evita duplicatas** - verifica se a imagem já existe antes de fazer upload

## ⚙️ Configuração do Sistema

O sistema agora está configurado para usar **Railway Storage** como padrão. As credenciais estão hardcoded no código, mas podem ser sobrescritas por variáveis de ambiente:

- `RAILWAY_STORAGE_ENDPOINT` (padrão: `https://storage.railway.app`)
- `RAILWAY_STORAGE_BUCKET` (padrão: `structured-case-p5vwdqw2`)
- `RAILWAY_STORAGE_ACCESS_KEY`
- `RAILWAY_STORAGE_SECRET_KEY`

## 🔍 Após a Migração

### Passo 1: Executar o SQL no Banco de Dados

Após a migração, o script gera um arquivo `update-urls.sql` na pasta `backend/`. 

**Opção A - Via Railway Dashboard:**
1. Acesse o serviço PostgreSQL no Railway
2. Vá em "Data" → "Query"
3. Cole o conteúdo do arquivo `update-urls.sql`
4. Execute a query

**Opção B - Via psql:**
```bash
psql $DATABASE_URL < backend/update-urls.sql
```

### Passo 2: Verificação

Após executar o SQL, verifique:

1. **Logs do script** - devem mostrar quantas imagens foram migradas
2. **Banco de dados** - as URLs devem começar com `https://storage.railway.app`
3. **Site** - as imagens devem carregar normalmente

## 📝 Notas Importantes

- O script **não deleta** as imagens do Cloudinary (você pode fazer isso manualmente depois)
- O script **atualiza automaticamente** o banco de dados
- Imagens que já existem no Railway Storage são **puladas** (não são duplicadas)
- O processo pode demorar dependendo da quantidade de imagens

## 🆘 Troubleshooting

### Erro: "Variáveis do Cloudinary não configuradas"
- Configure as variáveis de ambiente do Cloudinary antes de executar

### Erro: "Falha ao baixar imagem"
- Verifique sua conexão com a internet
- Verifique se as credenciais do Cloudinary estão corretas

### Erro: "Erro ao fazer upload"
- Verifique se as credenciais do Railway Storage estão corretas
- Verifique se o bucket existe e você tem permissão de escrita

### Imagens não aparecem após migração
- Verifique se as URLs no banco foram atualizadas
- Verifique se o Railway Storage está acessível publicamente
- Limpe o cache do navegador

## ✅ Após a Migração

1. **Teste o site** - verifique se todas as imagens carregam
2. **Verifique o banco** - confirme que as URLs foram atualizadas
3. **Opcional**: Remova as variáveis do Cloudinary se não for mais usar
4. **Opcional**: Delete as imagens do Cloudinary para economizar espaço

