# 📸 Configuração do Cloudinary - Armazenamento Persistente de Imagens

## ⚠️ Problema Resolvido

As imagens estavam sendo salvas na pasta `backend/uploads/`, que é **efêmera** no Railway. Isso significa que todas as imagens eram perdidas após cada redeploy ou reinicialização do servidor.

## ✅ Solução Implementada

Implementamos o **Cloudinary** como sistema de armazenamento persistente. Agora as imagens são salvas na nuvem e **nunca serão perdidas**, mesmo após redeploys.

## 🚀 Como Configurar

### Passo 1: Criar Conta no Cloudinary (Gratuito)

1. Acesse: https://cloudinary.com/users/register/free
2. Crie uma conta gratuita (não precisa de cartão de crédito)
3. Após criar, você será redirecionado para o Dashboard

### Passo 2: Obter as Credenciais

No Dashboard do Cloudinary, você encontrará:

- **Cloud Name** (exemplo: `dxyz123abc`)
- **API Key** (exemplo: `123456789012345`)
- **API Secret** (exemplo: `abcdefghijklmnopqrstuvwxyz123456`)

### Passo 3: Adicionar Variáveis no Railway

1. No Railway, vá no serviço do **backend**
2. Clique em **"Variables"**
3. Adicione as seguintes variáveis:

```
CLOUDINARY_CLOUD_NAME = (seu cloud name)
CLOUDINARY_API_KEY = (sua API key)
CLOUDINARY_API_SECRET = (seu API secret)
```

### Passo 4: Fazer Redeploy

Após adicionar as variáveis, o Railway fará um redeploy automático. As imagens agora serão salvas no Cloudinary!

## 🔍 Como Verificar se Está Funcionando

Após o redeploy, verifique os logs do backend. Você deve ver:

```
✅ Usando Cloudinary para armazenamento de imagens
```

Se aparecer:

```
⚠️  Cloudinary não configurado - usando armazenamento local (não persistente)
```

Significa que as variáveis não foram configuradas corretamente.

## 📝 Notas Importantes

1. **Plano Gratuito do Cloudinary:**
   - 25 GB de armazenamento
   - 25 GB de largura de banda por mês
   - Mais que suficiente para começar!

2. **Imagens Antigas:**
   - As imagens que já foram enviadas antes da configuração do Cloudinary podem não funcionar
   - Você precisará fazer upload novamente dessas imagens

3. **Desenvolvimento Local:**
   - Se não configurar as variáveis localmente, o sistema usará armazenamento local
   - Isso é OK para desenvolvimento, mas **não para produção**

4. **Migração de Imagens:**
   - Se você tiver imagens antigas que precisa migrar, será necessário fazer upload manual novamente

## 🎯 Benefícios

✅ **Persistência**: Imagens nunca serão perdidas  
✅ **CDN Global**: Imagens carregam rápido em qualquer lugar  
✅ **Otimização Automática**: Cloudinary otimiza as imagens automaticamente  
✅ **Gratuito**: Plano gratuito é suficiente para começar  
✅ **Escalável**: Pode crescer conforme necessário  

## 🔧 Troubleshooting

### Problema: "Erro ao fazer upload"

**Solução**: Verifique se as 3 variáveis de ambiente estão corretas no Railway.

### Problema: Imagens antigas não aparecem

**Solução**: Essas imagens foram perdidas. Você precisará fazer upload novamente.

### Problema: Logs mostram "usando armazenamento local"

**Solução**: As variáveis de ambiente não estão configuradas. Adicione-as no Railway e faça redeploy.

## 📚 Documentação

- Cloudinary: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration

