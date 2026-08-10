require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const ticketsRoutes = require('../routes/ticketsRoutes');
const referenceRoutes = require('../routes/referenceRoutes');
const authRoutes = require('../routes/authRoutes');

const app = express();

app.use(express.json());

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, now: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Erro ao conectar com o banco' });
  }
});

app.use('/tickets', ticketsRoutes);
app.use('/references', referenceRoutes);
app.use('/auth', authRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
