import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Verificar qual banco usar (PostgreSQL em produção, SQLite em desenvolvimento)
const usePostgres = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let db;
let isPostgres = false;

if (usePostgres) {
  // Usar PostgreSQL (Railway/Produção)
  isPostgres = true;
  const pool = new Pool({
    connectionString: usePostgres,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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

  console.log('✅ Conectado ao PostgreSQL (Railway)');
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
