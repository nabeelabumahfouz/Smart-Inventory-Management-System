const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { exec } = require('child_process');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_management',
  password: 'password',
  port: 5432,
});

// Endpoint to get all products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint to predict future sales
app.get('/predict-sales/:product_id/:future_date', (req, res) => {
  const { product_id, future_date } = req.params;
  exec(`python predict.py ${product_id} ${future_date}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send('Server error');
    }
    try {
      const prediction = JSON.parse(stdout);
      res.json(prediction);
    } catch (parseError) {
      console.error(`parse error: ${parseError}`);
      res.status(500).send('Error parsing prediction');
    }
  });
});

// Endpoint to get monthly sales summary
app.get('/sales-summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('month', sale_date) AS month,
        SUM(quantity_sold * price) AS total_sales
      FROM Sales
      JOIN Products ON Sales.product_id = Products.product_id
      GROUP BY month
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint to get sales summary within a date range
app.get('/sales-summary', async (req, res) => {
  const { start, end } = req.query;
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', sale_date) as month, SUM(quantity_sold) as total_sales
      FROM Sales
      WHERE sale_date BETWEEN $1 AND $2
      GROUP BY month
      ORDER BY month
    `, [start, end]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint to get best-selling products
app.get('/best-sellers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        product_name,
        SUM(quantity_sold) AS total_sold
      FROM Sales
      JOIN Products ON Sales.product_id = Products.product_id
      GROUP BY product_name
      ORDER BY total_sold DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint to add a product
app.post('/products', async (req, res) => {
  const { product_name, price, category, reorder_level } = req.body;
  try {
    const result = await pool.query('INSERT INTO products (product_name, price, category, reorder_level) VALUES ($1, $2, $3, $4) RETURNING *', [product_name, price, category, reorder_level]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint to update a product
app.put('/products/:product_id', async (req, res) => {
  const { product_id } = req.params;
  const { product_name, price, category, reorder_level } = req.body;
  try {
    const result = await pool.query('UPDATE products SET product_name = $1, price = $2, category = $3, reorder_level = $4 WHERE product_id = $5 RETURNING *', [product_name, price, category, reorder_level, product_id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint to delete a product
app.delete('/products/:product_id', async (req, res) => {
  const { product_id } = req.params;
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM predictsales WHERE product_id = $1', [product_id]);
    await pool.query('DELETE FROM inventory WHERE product_id = $1', [product_id]);
    await pool.query('DELETE FROM sales WHERE product_id = $1', [product_id]);
    const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [product_id]);
    await pool.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
