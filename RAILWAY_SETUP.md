# Configuração do PostgreSQL no Railway

## Problema
O SQLite perde dados quando o Railway reinicia porque o sistema de arquivos é efêmero.

## Solução
Migrar para PostgreSQL que é persistente no Railway.

## Passos para Configurar

### 1. Adicionar PostgreSQL no Railway
1. Acesse seu projeto no Railway
2. Clique em "New" → "Database" → "Add PostgreSQL"
3. O Railway criará automaticamente uma variável de ambiente `DATABASE_URL`

### 2. Configurar Variável de Ambiente
O código já está preparado para usar `DATABASE_URL` automaticamente:
- Se `DATABASE_URL` existir → usa PostgreSQL
- Se não existir → usa SQLite (desenvolvimento local)

### 3. Deploy
Após adicionar o PostgreSQL, faça o deploy novamente. O banco será criado automaticamente.

## Notas
- O código suporta ambos os bancos automaticamente
- Em desenvolvimento local (sem DATABASE_URL), continua usando SQLite
- Em produção (com DATABASE_URL), usa PostgreSQL persistente

