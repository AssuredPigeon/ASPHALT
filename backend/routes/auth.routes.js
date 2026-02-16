const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log("REGISTER HIT");
  console.log(req.body);

  try {
    const exists = await db.query(
      "SELECT id_usuario FROM usuarios WHERE email = $1",
      [email],
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya existe" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO usuarios (email, password_hash, nombre) VALUES ($1, $2, $3)",
      [email, passwordHash, "Usuario"],
    );

    res.json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    // Si no tiene password (usuario Google/Facebook)
    if (!user.password_hash) {
      return res.status(400).json({
        message: "Esta cuenta fue creada con Google o Facebook",
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 🔥 Generar JWT
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 30); // 30 días

    await db.query(
      `INSERT INTO refresh_tokens (id_usuario, token, expires_at)
      VALUES ($1, $2, $3)`,
      [user.id_usuario, refreshToken, refreshExpires],
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        nivel: user.nivel,
        puntos: user.puntos,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

/* GOOGLE LOGIN */
router.post("/google", async (req, res) => {
  const { id_token } = req.body;

  try {
    // Verificar token con Google
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    // sub = ID único que Google da al usuario
    const googleId = sub;

    // Buscar usuario por email
    let result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    let user;

    if (result.rows.length === 0) {
      // Crear usuario nuevo
      const newUser = await db.query(
        `INSERT INTO usuarios (email, nombre)
         VALUES ($1, $2)
         RETURNING *`,
        [email, name || "Usuario Google"],
      );

      user = newUser.rows[0];
    } else {
      user = result.rows[0];
    }

    // Verificar si ya existe provider Google para este usuario
    const providerCheck = await db.query(
      `SELECT * FROM usuarios_auth_providers
       WHERE provider = 'google'
       AND provider_user_id = $1`,
      [googleId],
    );

    if (providerCheck.rows.length === 0) {
      // Insertar provider
      await db.query(
        `INSERT INTO usuarios_auth_providers
         (id_usuario, provider, provider_user_id)
         VALUES ($1, 'google', $2)`,
        [user.id_usuario, googleId],
      );
    }

    // Generar JWT
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 30); // 30 días

    await db.query(
      `INSERT INTO refresh_tokens (id_usuario, token, expires_at)
      VALUES ($1, $2, $3)`,
      [user.id_usuario, refreshToken, refreshExpires],
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        nivel: user.nivel,
        puntos: user.puntos,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token de Google inválido" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el correo existe
    const result = await db.query(
      "SELECT id_usuario FROM usuarios WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      // Correo no registrado
      return res.status(404).json({ message: "Correo no registrado" });
    }

    const user = result.rows[0];

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código en la tabla password_resets
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await db.query(
      `INSERT INTO password_resets (id_usuario, code, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id_usuario, code, expires],
    );

    // Enviar código por correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Código de verificación - Asphalt",
      html: `<p>Tu código de verificación es: <b>${code}</b></p>
             <p>Expira en 15 minutos.</p>`,
    });

    // Respuesta
    res.json({ message: "Código enviado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al procesar solicitud." });
  }
});

router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    const userResult = await db.query(
      "SELECT id_usuario FROM usuarios WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    const result = await db.query(
      `SELECT * FROM password_resets
       WHERE id_usuario = $1
       AND code = $2
       AND used = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id_usuario, code],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Código inválido" });
    }

    const reset = result.rows[0];

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ message: "Código expirado" });
    }

    res.json({ message: "Código válido" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al verificar código" });
  }
});

router.post("/reset-password", async (req, res) => {
  //console.log("BODY RECIBIDO:", req.body);
  const { email, password } = req.body;

  try {
    // Verificar que el usuario exista
    const userResult = await db.query(
      "SELECT id_usuario FROM usuarios WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Actualizar contraseña
    await db.query(
      "UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2",
      [passwordHash, user.id_usuario],
    );

    // Marcar código como usado
    await db.query(
      "UPDATE password_resets SET used = TRUE WHERE id_usuario = $1",
      [user.id_usuario],
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar contraseña" });
  }
});

/* REFRESH TOKEN */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token requerido" });
  }

  try {
    const result = await db.query(
      `SELECT * FROM refresh_tokens
       WHERE token = $1
       AND revoked = FALSE`,
      [refreshToken],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Refresh token inválido" });
    }

    const storedToken = result.rows[0];

    if (new Date(storedToken.expires_at) < new Date()) {
      return res.status(403).json({ message: "Refresh token expirado" });
    }

    // Obtener usuario
    const userResult = await db.query(
      "SELECT * FROM usuarios WHERE id_usuario = $1",
      [storedToken.id_usuario],
    );

    const user = userResult.rows[0];

    // Generar nuevo access token
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al refrescar token" });
  }
});

/* LOGOUT */
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token requerido" });
  }

  try {
    await db.query(
      `UPDATE refresh_tokens
       SET revoked = TRUE
       WHERE token = $1`,
      [refreshToken],
    );

    res.json({ message: "Logout exitoso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cerrar sesión" });
  }
});

module.exports = router;
