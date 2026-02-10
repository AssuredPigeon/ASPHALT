const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

/* REGISTER */
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [exists] = await db.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: 'El correo ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO usuarios (email, password_hash, nombre) VALUES (?, ?, ?)',
      [email, passwordHash, 'Usuario']
    );

    res.json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

/* LOGIN */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      id_usuario: user.id_usuario,
      email: user.email,
      nivel: user.nivel,
      puntos: user.puntos,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

module.exports = router;
