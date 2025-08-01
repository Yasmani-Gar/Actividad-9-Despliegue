const express = require('express');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

// Ajustar zona horaria a América/Bogota (-05:00)
process.env.TZ = 'America/Bogota';

app.use(cors());
app.use(express.json());

// Ruta raíz redirige a login.html
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Sirve archivos estáticos después de la ruta raíz
app.use(express.static('public'));

// Clave secreta para JWT (cámbiala en producción)
const JWT_SECRET = 'tu_clave_secreta';

// Inicializar usuario admin si no existe
db.get(`SELECT email FROM users WHERE email = ?`, ['admin@example.com'], (err, user) => {
  if (err) console.error('Error al verificar usuario:', err);
  if (!user) {
    const initialPassword = '123'; // Contraseña inicial
    const hashedPassword = bcrypt.hashSync(initialPassword, 10);
    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      ['Admin', 'admin@example.com', hashedPassword], (err) => {
        if (err) console.error('Error al crear usuario inicial:', err);
      });
  }
});

// Registro de usuarios
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, hashedPassword], (err) => {
      if (err) return res.status(400).send({ error: err.message || 'Email ya registrado' });
      res.status(201).send({ message: 'Usuario creado' });
    });
});

// Login de usuarios
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      console.error('Error en la consulta de login:', err);
      return res.status(500).send({ error: 'Error en el servidor' });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET);
    console.log('Login exitoso, token generado:', token);
    res.send({ token });
  });
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Header recibido:', authHeader);
  if (!authHeader) return res.status(401).send({ error: 'Token requerido' });
  const token = authHeader.split(' ')[1]; // Extrae el token después de 'Bearer'
  if (!token) return res.status(401).send({ error: 'Token malformado' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Error al verificar token:', err.message);
      return res.status(403).send({ error: 'Token inválido' });
    }
    req.user = user;
    console.log('Token válido, usuario:', user);
    next();
  });
};

// CRUD para productos
app.get('/api/products', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).send({ error: err.message });
    }
    res.send(rows);
  });
});

app.get('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error al obtener producto por ID:', err);
      return res.status(500).send({ error: err.message });
    }
    if (!row) return res.status(404).send({ error: 'Producto no encontrado' });
    res.send(row);
  });
});

app.post('/api/products', authenticateToken, (req, res) => {
  const { name, category, stock, price } = req.body;
  console.log('Recibiendo producto:', { name, category, stock, price });

  const runWithRetry = (sql, params, callback, retries = 3) => {
    db.run(sql, params, (err) => {
      if (err && err.code === 'SQLITE_BUSY' && retries > 0) {
        console.warn('Base de datos bloqueada, reintentando...', retries);
        setTimeout(() => runWithRetry(sql, params, callback, retries - 1), 100);
      } else if (err) {
        console.error('Error al ejecutar consulta:', err);
        callback(err);
      } else {
        callback(null);
      }
    });
  };

  runWithRetry(`INSERT INTO products (name, category, stock, price) VALUES (?, ?, ?, ?)`,
    [name, category, stock, price], (err) => {
      if (err) {
        console.error('Error al crear producto:', err);
        return res.status(500).send({ error: err.message });
      }
      db.get(`SELECT last_insert_rowid() as id`, [], (err, row) => {
        if (err) {
          console.error('Error al obtener ID:', err);
          return res.status(500).send({ error: err.message });
        }
        const productId = row.id;
        console.log('Producto creado, ID:', productId);
        const createdAt = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
        runWithRetry(`INSERT INTO history (product_id, name, type, quantity, created_at) VALUES (?, ?, ?, ?, ?)`,
          [productId, name, 'creado', stock, createdAt], (histErr) => {
            if (histErr) {
              console.error('Error al registrar creación en historial:', histErr);
              if (histErr.code === 'SQLITE_BUSY') {
                runWithRetry(`INSERT INTO history (product_id, name, type, quantity, created_at) VALUES (?, ?, ?, ?, ?)`,
                  [productId, name, 'creado', stock, createdAt], (retryErr) => {
                    if (retryErr) console.error('Fallo definitivo en historial:', retryErr);
                  });
              }
            } else {
              console.log('Registro en historial creado con éxito');
            }
          });
        res.status(201).send({ message: 'Producto creado', id: productId });
      });
    });
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, category, stock, price } = req.body;
  db.get(`SELECT name FROM products WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error al obtener nombre para historial:', err);
      return res.status(500).send({ error: err.message });
    }
    const oldName = row ? row.name : name;
    db.run(`UPDATE products SET name = ?, category = ?, stock = ?, price = ? WHERE id = ?`,
      [name, category, stock, price, id], (err) => {
        if (err) {
          console.error('Error al actualizar producto:', err);
          return res.status(500).send({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).send({ error: 'Producto no encontrado' });
        const createdAt = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
        db.run(`INSERT INTO history (product_id, name, type, quantity, created_at) VALUES (?, ?, ?, ?, ?)`,
          [id, oldName, 'actualizado', stock, createdAt], (histErr) => {
            if (histErr) {
              console.error('Error al registrar actualización en historial:', histErr);
              if (histErr.code === 'SQLITE_BUSY') {
                db.run(`INSERT INTO history (product_id, name, type, quantity, created_at) VALUES (?, ?, ?, ?, ?)`,
                  [id, oldName, 'actualizado', stock, createdAt], (retryErr) => {
                    if (retryErr) console.error('Fallo definitivo en historial:', retryErr);
                  });
              }
            } else {
              console.log('Registro de actualización en historial creado con éxito');
            }
          });
        res.send({ message: 'Producto actualizado' });
      });
  });
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get(`SELECT name, stock FROM products WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error al obtener producto para eliminar:', err);
      return res.status(500).send({ error: err.message });
    }
    const { name, stock } = row || { name: 'Producto eliminado', stock: 0 };
    db.run(`DELETE FROM products WHERE id = ?`, [id], (err) => {
      if (err) {
        console.error('Error al eliminar producto:', err);
        return res.status(500).send({ error: err.message });
      }
      const createdAt = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
      db.run(`INSERT INTO history (product_id, name, type, quantity, created_at) VALUES (?, ?, ?, ?, ?)`,
        [id, name, 'eliminado', stock, createdAt], (histErr) => {
          if (histErr) {
            console.error('Error al registrar eliminación en historial:', histErr);
            if (histErr.code === 'SQLITE_BUSY') {
              db.run(`INSERT INTO history (product_id, name, type, quantity, created_at) VALUES (?, ?, ?, ?, ?)`,
                [id, name, 'eliminado', stock, createdAt], (retryErr) => {
                  if (retryErr) console.error('Fallo definitivo en historial:', retryErr);
                });
            }
          } else {
            console.log('Registro de eliminación en historial creado con éxito');
          }
        });
      res.send({ message: 'Producto eliminado' });
    });
  });
});

// Historial
app.get('/api/history', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM history`, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener historial:', err);
      return res.status(500).send({ error: err.message });
    }
    console.log('Historial devuelto:', rows);
    res.send(rows);
  });
});

// Endpoint de prueba
app.post('/api/test-password', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) return res.status(404).send({ error: 'Usuario no encontrado' });
    const match = bcrypt.compareSync(password, user.password);
    res.send({ match, hash: user.password });
  });
});

// Iniciar servidor
app.listen(3000, () => console.log('Servidor en http://localhost:3000'));