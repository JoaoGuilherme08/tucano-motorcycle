# 🔍 Como Verificar se o PostgreSQL está Sendo Usado

## No Railway - Verificar Variáveis de Ambiente

1. Acesse seu projeto no Railway
2. Vá no serviço do **backend** (não no PostgreSQL)
3. Clique em **"Variables"** (Variáveis)
4. Procure por `DATABASE_URL` ou `POSTGRES_URL`
5. Se não existir, você precisa:
   - Ir no serviço **PostgreSQL**
   - Clicar em **"Variables"**
   - Copiar o valor de `DATABASE_URL` ou `POSTGRES_PRIVATE_URL`
   - Adicionar no serviço do **backend** como `DATABASE_URL`

## Verificar Logs do Backend

Após fazer deploy, verifique os logs do backend no Railway. Você deve ver:

```
🔍 Verificando banco de dados...
DATABASE_URL: ✅ Definido
✅ Conectado ao PostgreSQL (Railway)
🔧 Inicializando banco de dados...
isPostgres: true
📊 Criando tabelas no PostgreSQL...
✅ Tabelas criadas com sucesso no PostgreSQL!
✅ Banco de dados inicializado com sucesso!
```

Se aparecer:
```
❌ NÃO - Usando SQLite
✅ Conectado ao SQLite (Desenvolvimento local)
```

Significa que `DATABASE_URL` não está configurado no backend.

## Solução Rápida

1. No Railway, vá no serviço **PostgreSQL**
2. Em **"Variables"**, copie o valor de `DATABASE_URL` ou `POSTGRES_PRIVATE_URL`
3. Vá no serviço do **backend**
4. Em **"Variables"**, adicione:
   - **Nome:** `DATABASE_URL`
   - **Valor:** (cole o valor copiado)
5. Faça **redeploy** do backend

## Testar Localmente

Para testar localmente com PostgreSQL, adicione no `.env` do backend:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

Ou continue usando SQLite localmente (sem DATABASE_URL).

