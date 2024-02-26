const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: '',
  password: '',
  database: '',
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL database');
    createTable();
  }
});

function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      short_description VARCHAR(255),
      long_description TEXT,
      category VARCHAR(255),
      image BLOB
    )
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('MySQL CREATE TABLE error:', err);
    } else {
      console.log('Table "products" created successfully');
      startServer();
    }
  });
}

function startServer() {

    app.use(express.static('public'));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  

  app.post('/api/product', (req, res) => {
    const { pname, price, sdesc, ldesc, category, image } = req.body;

    const sql = `
      INSERT INTO products (product_name, price, short_description, long_description, category, image) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [pname, price, sdesc, ldesc, category, image], (err, result) => {
      if (err) {
        console.error('MySQL INSERT error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(201).send('Product added successfully');
      }
    });
  });


  app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products';
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error('MySQL SELECT error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).json(result);
      }
    });
  });
  

  app.put('/api/product/:id', (req, res) => {
    const productId = req.params.id;
    const { pname, price, sdesc, ldesc, category, image } = req.body;

    const sql = `
      UPDATE products 
      SET product_name=?, price=?, short_description=?, long_description=?, category=?, image=? 
      WHERE id=?
    `;

    db.query(sql, [pname, price, sdesc, ldesc, category, image, productId], (err, result) => {
      if (err) {
        console.error('MySQL UPDATE error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).send('Product updated successfully');
      }
    });
  });

 
  app.delete('/api/product/:id', (req, res) => {
    const productId = req.params.id;

    const sql = 'DELETE FROM products WHERE id=?';

    db.query(sql, [productId], (err, result) => {
      if (err) {
        console.error('MySQL DELETE error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).send('Product deleted successfully');
      }
    });
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
