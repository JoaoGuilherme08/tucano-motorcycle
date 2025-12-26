import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Verificar qual banco usar (PostgreSQL em produção, SQLite em desenvolvimento)
// Railway usa DATABASE_URL quando você conecta o PostgreSQL ao backend
// Se não estiver conectado, você precisa adicionar manualmente
const usePostgres = process.env.DATABASE_URL 
  || process.env.POSTGRES_URL 
  || process.env.POSTGRES_PRIVATE_URL
  || process.env.POSTGRES_PUBLIC_URL;

console.log('🔍 Verificando banco de dados...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Definido' : '❌ Não definido');
console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Definido' : '❌ Não definido');
console.log('POSTGRES_PRIVATE_URL:', process.env.POSTGRES_PRIVATE_URL ? '✅ Definido' : '❌ Não definido');
console.log('usePostgres:', usePostgres ? '✅ SIM - Usando PostgreSQL' : '❌ NÃO - Usando SQLite');

if (!usePostgres) {
  console.log('');
  console.log('⚠️  ATENÇÃO: DATABASE_URL não encontrado!');
  console.log('📝 Para usar PostgreSQL no Railway:');
  console.log('   1. Vá no serviço PostgreSQL → Variables');
  console.log('   2. Copie o valor de DATABASE_URL ou POSTGRES_PRIVATE_URL');
  console.log('   3. Vá no serviço Backend → Variables');
  console.log('   4. Adicione: Nome=DATABASE_URL, Valor=(cole o valor copiado)');
  console.log('   5. Faça redeploy do backend');
  console.log('');
}

let db;
let isPostgres = false;

if (usePostgres) {
  // Usar PostgreSQL (Railway/Produção)
  isPostgres = true;
  
  // Configurar SSL para Railway (sempre requer SSL em produção)
  const sslConfig = usePostgres.includes('railway') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false;
  
  console.log('🔌 Configurando conexão PostgreSQL...');
  console.log('SSL:', sslConfig ? 'Habilitado' : 'Desabilitado');
  
  const pool = new Pool({
    connectionString: usePostgres,
    ssl: sslConfig,
    // Configurações adicionais para Railway
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  // Testar conexão
  pool.on('connect', () => {
    console.log('✅ Cliente PostgreSQL conectado');
  });
  
  pool.on('error', (err) => {
    console.error('❌ Erro inesperado no cliente PostgreSQL:', err);
  });

  // Criar uma interface compatível com better-sqlite3
  db = {
    pool,
    isPostgres: true,
    prepare: (query) => {
      // Converter placeholders ? para $1, $2, etc para PostgreSQL
      // Mas preservar ? dentro de strings literais
      let paramIndex = 1;
      let inString = false;
      let pgQuery = '';
      
      for (let i = 0; i < query.length; i++) {
        const char = query[i];
        const prevChar = i > 0 ? query[i - 1] : '';
        
        if (char === "'" && prevChar !== '\\') {
          inString = !inString;
          pgQuery += char;
        } else if (char === '?' && !inString) {
          pgQuery += `$${paramIndex++}`;
        } else {
          pgQuery += char;
        }
      }
      
      return {
        all: async (...params) => {
          const result = await pool.query(pgQuery, params);
          return result.rows;
        },
        get: async (...params) => {
          const result = await pool.query(pgQuery, params);
          return result.rows[0] || null;
        },
        run: async (...params) => {
          const result = await pool.query(pgQuery, params);
          return { changes: result.rowCount || 0, lastInsertRowid: null };
        },
      };
    },
    exec: async (queries) => {
      // Executar múltiplas queries separadas por ponto e vírgula
      const queryList = queries.split(';').filter(q => q.trim());
      for (const q of queryList) {
        if (q.trim()) {
          await pool.query(q.trim());
        }
      }
    },
  };

  // Testar conexão imediatamente
  try {
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conectado ao PostgreSQL (Railway) - Conexão testada!');
    console.log('⏰ Hora do servidor PostgreSQL:', testResult.rows[0].current_time);
  } catch (error) {
    console.error('❌ Erro ao testar conexão PostgreSQL:', error.message);
    console.error('Detalhes:', error);
    // Não lançar erro aqui, deixar o servidor iniciar para ver outros erros
  }
} else {
  // Usar SQLite (Desenvolvimento local)
  isPostgres = false;
  const dbPath = path.join(__dirname, 'database.sqlite');
  db = new Database(dbPath);
  db.isPostgres = false;
  console.log('✅ Conectado ao SQLite (Desenvolvimento local)');
}

export default db;
export { isPostgres };
