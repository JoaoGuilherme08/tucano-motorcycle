# 🔧 Variáveis de Ambiente Necessárias no Railway

## ✅ Única Variável Necessária

**Apenas `DATABASE_URL` é necessária!**

O código verifica automaticamente estas variáveis (em ordem de prioridade):
1. `DATABASE_URL` ⭐ (Principal - use esta)
2. `POSTGRES_URL`
3. `POSTGRES_PRIVATE_URL`
4. `POSTGRES_PUBLIC_URL`

## 📋 Como Adicionar no Railway

### Opção 1: Conectar Serviços (Automático) ⭐ RECOMENDADO

1. No Railway, vá no serviço do **backend**
2. Clique na aba **"Settings"**
3. Role até **"Service Connections"** ou **"Connect Service"**
4. Selecione o serviço **PostgreSQL**
5. O Railway criará automaticamente a `DATABASE_URL` no backend

### Opção 2: Manual (Se a Opção 1 não funcionar)

1. No serviço **PostgreSQL** → **"Variables"**
2. Copie o valor de `DATABASE_URL` ou `POSTGRES_PRIVATE_URL`
3. No serviço **Backend** → **"Variables"**
4. Clique em **"New Variable"**
5. Adicione:
   - **Nome:** `DATABASE_URL`
   - **Valor:** (cole o valor copiado)
6. Clique em **"Add"**

## 🔍 Verificar se Está Funcionando

Após adicionar a variável e fazer deploy, verifique os logs do backend. Você deve ver:

```
🔍 Verificando banco de dados...
DATABASE_URL: ✅ Definido
✅ SIM - Usando PostgreSQL
✅ Conectado ao PostgreSQL (Railway) - Conexão testada!
📊 Criando tabelas no PostgreSQL...
✅ Tabelas criadas com sucesso no PostgreSQL!
```

## ❌ Se Aparecer Isso:

```
DATABASE_URL: ❌ Não definido
❌ NÃO - Usando SQLite
```

Significa que a variável não foi adicionada corretamente.

## 📝 Notas

- **Não precisa** de outras variáveis além de `DATABASE_URL`
- O código detecta automaticamente qual banco usar
- Se `DATABASE_URL` não existir → usa SQLite (desenvolvimento)
- Se `DATABASE_URL` existir → usa PostgreSQL (produção)

