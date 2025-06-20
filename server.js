const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

// Conexão com PostgreSQL (use sua URL do Render)
const pool = new Pool({
  connectionString: "postgresql://police_user:tD16V09vlAr6SLOBNv9uDylkCuoJPbMF@dpg-d1aufk15pdvs73dachbg-a.oregon-postgres.render.com/police",
  ssl: {
    rejectUnauthorized: false // Necessário para Render.com
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Criar tabelas (execute uma vez)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      rank VARCHAR(20) DEFAULT 'RECRUTA',
      badges TEXT[] DEFAULT ARRAY[]::TEXT[],
      verified BOOLEAN DEFAULT FALSE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      author VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
initDB();

// Rotas
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, password]
    );
    res.status(201).json({ message: 'Usuário registrado!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:username', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [req.params.username]
  );
  res.json(rows[0] || { error: 'Usuário não encontrado' });
});

// Inicie o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));