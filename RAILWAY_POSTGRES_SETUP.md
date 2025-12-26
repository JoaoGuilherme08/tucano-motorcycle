# 🚀 Configuração PostgreSQL no Railway

## Problema Resolvido
O SQLite perde dados quando o Railway reinicia porque o sistema de arquivos é **efêmero** (temporário). Esta solução migra para PostgreSQL que é **persistente**.

## ✅ Solução Implementada

O código agora suporta **automaticamente**:
- **PostgreSQL** quando `DATABASE_URL` está configurado (Railway/Produção)
- **SQLite** quando `DATABASE_URL` não existe (Desenvolvimento local)

## 📋 Passos para Configurar no Railway

### 1. Adicionar PostgreSQL no Railway

1. Acesse seu projeto no Railway: https://railway.app
2. No seu projeto, clique em **"New"** → **"Database"** → **"Add PostgreSQL"**
3. O Railway criará automaticamente:
   - Um serviço PostgreSQL
   - A variável de ambiente `DATABASE_URL` automaticamente

### 2. Verificar Variável de Ambiente

1. No seu serviço backend no Railway
2. Vá em **"Variables"** (Variáveis)
3. Verifique se `DATABASE_URL` está presente (deve estar automaticamente)
4. O formato será algo como: `postgresql://user:password@host:port/database`

### 3. Fazer Deploy

1. Faça commit e push das alterações:
```bash
git add .
git commit -m "Migração para PostgreSQL para persistência de dados"
git push
```

2. O Railway fará o deploy automaticamente
3. O banco será criado automaticamente na primeira execução

## 🔍 Como Funciona

### Desenvolvimento Local (SQLite)
- Sem `DATABASE_URL` → usa SQLite
- Banco salvo em `backend/database.sqlite`
- Funciona normalmente para desenvolvimento

### Produção (PostgreSQL)
- Com `DATABASE_URL` → usa PostgreSQL
- Dados persistem mesmo após restarts
- Banco gerenciado pelo Railway

## 🧪 Testando

Após o deploy, verifique:
1. Logs do Railway devem mostrar: `✅ Conectado ao PostgreSQL (Railway)`
2. Cadastre uma moto
3. Reinicie o serviço
4. A moto deve continuar existindo! ✅

## 📝 Notas Importantes

- **Não precisa** configurar nada manualmente
- O código detecta automaticamente qual banco usar
- As queries são convertidas automaticamente (SQLite → PostgreSQL)
- Todas as funcionalidades continuam funcionando igual

## 🆘 Troubleshooting

### Se os dados ainda sumirem:
1. Verifique se `DATABASE_URL` está configurado no Railway
2. Verifique os logs: deve aparecer "Conectado ao PostgreSQL"
3. Se aparecer "Conectado ao SQLite", o `DATABASE_URL` não está configurado

### Se der erro de conexão:
1. Verifique se o serviço PostgreSQL está rodando no Railway
2. Verifique se `DATABASE_URL` está correto
3. Verifique os logs do PostgreSQL no Railway

