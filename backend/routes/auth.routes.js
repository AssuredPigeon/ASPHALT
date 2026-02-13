const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const crypto = require('crypto');
const nodemailer = require('nodemailer');


const router = express.Router();

/* REGISTER */
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log("REGISTER HIT");
  console.log(req.body);

  try {
    const exists = await db.query(
      'SELECT id_usuario FROM usuarios WHERE email = $1',
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO usuarios (email, password_hash, nombre) VALUES ($1, $2, $3)',
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
    const result = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
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

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el correo existe
    const result = await db.query(
      'SELECT id_usuario FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Correo no registrado
      return res.status(404).json({ message: 'Correo no registrado' });
    }

    const user = result.rows[0];

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código en la tabla password_resets
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await db.query(
      `INSERT INTO password_resets (id_usuario, code, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id_usuario, code, expires]
    );

    // Enviar código por correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'danieltornero4@gmail.com',
        pass: 'game zucg yvqx tads'
      }
    });

    await transporter.sendMail({
      to: email,
      subject: 'Código de verificación - Asphalt',
      html: `<p>Tu código de verificación es: <b>${code}</b></p>
             <p>Expira en 15 minutos.</p>`
    });

    // Respuesta
    res.json({ message: 'Código enviado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar solicitud.' });
  }
});

router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    const userResult = await db.query(
      'SELECT id_usuario FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    const result = await db.query(
      `SELECT * FROM password_resets
       WHERE id_usuario = $1
       AND code = $2
       AND used = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id_usuario, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Código inválido' });
    }

    const reset = result.rows[0];

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Código expirado' });
    }

    res.json({ message: 'Código válido' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al verificar código' });
  }
});

router.post('/reset-password', async (req, res) => {
  //console.log("BODY RECIBIDO:", req.body);
  const { email, password } = req.body;

  try {
    // Verificar que el usuario exista
    const userResult = await db.query(
      'SELECT id_usuario FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Actualizar contraseña
    await db.query(
      'UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2',
      [passwordHash, user.id_usuario]
    );

    // Marcar código como usado (opcional pero recomendado)
    await db.query(
      'UPDATE password_resets SET used = TRUE WHERE id_usuario = $1',
      [user.id_usuario]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
});

module.exports = router;
