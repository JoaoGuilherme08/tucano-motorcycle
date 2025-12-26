# 🔗 Como Conectar o Backend ao PostgreSQL no Railway

## ⚠️ Problema Comum
O Railway cria o PostgreSQL, mas a variável `DATABASE_URL` fica apenas no serviço PostgreSQL, não no backend automaticamente.

## ✅ Solução Passo a Passo

### 1. Encontrar a URL do PostgreSQL

1. No Railway, clique no serviço **PostgreSQL** (não no backend)
2. Vá na aba **"Variables"** (Variáveis)
3. Procure por uma destas variáveis:
   - `DATABASE_URL`
   - `POSTGRES_PRIVATE_URL` 
   - `POSTGRES_URL`
4. **Copie o valor completo** (algo como: `postgresql://postgres:senha@host:port/railway`)

### 2. Adicionar no Backend

1. No Railway, clique no serviço do **backend** (não no PostgreSQL)
2. Vá na aba **"Variables"** (Variáveis)
3. Clique em **"New Variable"** (Nova Variável)
4. Adicione:
   - **Nome:** `DATABASE_URL`
   - **Valor:** (cole o valor que você copiou do PostgreSQL)
5. Clique em **"Add"**

### 3. Fazer Redeploy

1. Após adicionar a variável, o Railway pode fazer redeploy automaticamente
2. Se não fizer, vá em **"Deployments"** → **"Redeploy"**

### 4. Verificar Logs

Após o redeploy, verifique os logs do backend. Você deve ver:

```
🔍 Verificando banco de dados...
DATABASE_URL: ✅ Definido
✅ SIM - Usando PostgreSQL
🔌 Configurando conexão PostgreSQL...
✅ Conectado ao PostgreSQL (Railway) - Conexão testada!
🔧 Inicializando banco de dados...
isPostgres: true
📊 Criando tabelas no PostgreSQL...
✅ Tabelas criadas com sucesso no PostgreSQL!
✅ Banco de dados inicializado com sucesso!
```

### 5. Verificar Tabelas

1. No Railway, vá no serviço **PostgreSQL**
2. Clique em **"Data"** (ou use o botão **"Connect"**)
3. Você deve ver as tabelas:
   - `users`
   - `vehicles`
   - `vehicle_images`

## 🆘 Se Ainda Não Funcionar

### Verificar se a variável está correta:
1. No backend, em **"Variables"**, verifique se `DATABASE_URL` existe
2. O valor deve começar com `postgresql://` ou `postgres://`

### Verificar logs de erro:
- Procure por mensagens de erro nos logs do backend
- Erros comuns:
  - `Connection refused` → URL incorreta
  - `SSL required` → Problema com SSL
  - `Authentication failed` → Senha incorreta

### Testar conexão manualmente:
1. No PostgreSQL, clique em **"Connect"**
2. Use as credenciais para testar se o banco está acessível

## 📝 Nota Importante

**O Railway NÃO conecta automaticamente o backend ao PostgreSQL!**
Você precisa **manualmente** copiar a `DATABASE_URL` do PostgreSQL e adicionar no backend.

