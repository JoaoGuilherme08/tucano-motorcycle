# 🚗 Velocity Motors - Vitrine de Veículos Premium

Um site moderno e elegante para vitrine de veículos (carros e motos), com design premium em preto e laranja, focado em conversão de vendas e fácil gerenciamento pelo administrador.

![Velocity Motors](https://via.placeholder.com/1200x600/000000/FF6A00?text=Velocity+Motors)

## ✨ Características

### Frontend
- ⚡ **React 18** com Vite para performance otimizada
- 🎨 **Design Premium** em preto (#000000) e laranja (#FF6A00)
- 📱 **Totalmente Responsivo** - Mobile-first design
- 🎭 **Animações Suaves** com Framer Motion
- 🔍 **Filtros Avançados** por modelo, ano, preço e km
- 🖼️ **Galeria de Fotos** com carousel e lightbox
- ⏳ **Skeleton Loading** para melhor UX

### Backend
- 🚀 **Node.js + Express** para API RESTful
- 🗃️ **SQLite** para banco de dados simples e portátil
- 🔐 **JWT** para autenticação segura
- 📤 **Upload de Imagens** com Multer
- 🔒 **Bcrypt** para hash de senhas

### Área Administrativa
- 🔑 Login seguro com autenticação JWT
- 📊 Dashboard com estatísticas
- ➕ Criar, editar e excluir veículos
- 📷 Upload de múltiplas fotos
- 👁️ Preview do anúncio antes de publicar
- ⭐ Marcar veículos como destaque

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 1. Clone ou navegue até o projeto

```bash
cd ~/veiculos-premium
```

### 2. Instalar dependências do Backend

```bash
cd backend
npm install
```

### 3. Instalar dependências do Frontend

```bash
cd ../frontend
npm install
```

### 4. Executar o Backend (porta 3001)

```bash
cd ../backend
npm run dev
```

### 5. Executar o Frontend (em outro terminal, porta 5173)

```bash
cd ../frontend
npm run dev
```

### 6. Acessar o site

- **Site:** http://localhost:5173
- **API:** http://localhost:3001

## 🔑 Credenciais de Acesso

Ao iniciar o backend pela primeira vez, um usuário admin é criado automaticamente:

- **Usuário:** `admin`
- **Senha:** `admin123`

## 📁 Estrutura do Projeto

```
veiculos-premium/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── package.json
│   ├── database.sqlite    # Banco de dados (criado automaticamente)
│   └── uploads/           # Imagens dos veículos
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Context API (Auth)
│   │   ├── services/      # Serviços de API
│   │   └── App.jsx        # Componente principal
│   ├── public/
│   └── package.json
│
└── README.md
```

## 📱 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial com hero, destaques e sobre |
| `/veiculos` | Listagem de veículos com filtros |
| `/veiculo/:id` | Detalhes do veículo |
| `/login` | Login administrativo |
| `/admin` | Dashboard administrativo |
| `/admin/veiculos` | Gerenciar veículos |
| `/admin/veiculos/novo` | Cadastrar novo veículo |
| `/admin/veiculos/editar/:id` | Editar veículo |

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Veículos
- `GET /api/vehicles` - Listar veículos (com filtros)
- `GET /api/vehicles/:id` - Detalhes do veículo
- `POST /api/vehicles` - Criar veículo (auth)
- `PUT /api/vehicles/:id` - Atualizar veículo (auth)
- `DELETE /api/vehicles/:id` - Remover veículo (auth)

### Estatísticas
- `GET /api/stats` - Estatísticas (auth)

## 🎨 Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Preto | `#000000` | Background principal |
| Preto Claro | `#0a0a0a` | Background secundário |
| Cinza Escuro | `#1a1a1a` | Cards |
| Cinza | `#2a2a2a` | Bordas |
| Laranja | `#FF6A00` | Cor de destaque |
| Laranja Claro | `#FF8533` | Hover |
| Branco | `#FFFFFF` | Texto principal |
| Cinza Texto | `#888888` | Texto secundário |

## 📦 Tecnologias Utilizadas

### Frontend
- React 18
- React Router DOM
- Framer Motion
- Axios
- Lucide React Icons

### Backend
- Node.js
- Express
- Better-SQLite3
- JSON Web Token (JWT)
- Bcrypt.js
- Multer
- UUID

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

---

Desenvolvido com 🧡 por você!

