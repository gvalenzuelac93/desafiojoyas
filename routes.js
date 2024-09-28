const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'joyas',
  password: 'LmGl1993',
  port: 5432,
});

router.get('/joyas', async (req, res) => {
  try {
    const { limits = 10, page = 1, order_by = 'id_ASC' } = req.query;
    const [field, direction] = order_by.split('_');
    const offset = (page - 1) * limits;
    
    const query = `
      SELECT * FROM inventario
      ORDER BY ${field} ${direction}
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limits, offset]);

    const joyas = result.rows;
    const totalJoyas = await pool.query('SELECT COUNT(*) FROM inventario');
    
    const response = {
      total: totalJoyas.rows[0].count,
      joyas,
      _links: {
        self: `/joyas?limits=${limits}&page=${page}&order_by=${order_by}`,
        next: `/joyas?limits=${limits}&page=${parseInt(page) + 1}&order_by=${order_by}`,
        previous: page > 1 ? `/joyas?limits=${limits}&page=${page - 1}&order_by=${order_by}` : null
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en la base de datos:', error); // Registra los detalles del error
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Ruta GET /joyas/filtros
router.get('/joyas/filtros', async (req, res) => {
  try {
    const { precio_min = 0, precio_max = 999999, categoria, metal } = req.query;
    let query = 'SELECT * FROM inventario WHERE precio >= $1 AND precio <= $2';
    let values = [precio_min, precio_max];

    if (categoria) {
      query += ' AND categoria = $3';
      values.push(categoria);
    }
    if (metal) {
      query += ' AND metal = $4';
      values.push(metal);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en la base de datos:', error); // Registra los detalles del error
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

module.exports = router;