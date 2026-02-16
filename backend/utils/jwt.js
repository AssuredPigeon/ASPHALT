const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function generateAccessToken(user) {
  return jwt.sign(
    {
      id_usuario: user.id_usuario,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES,
    },
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

module.exports = { generateAccessToken, generateRefreshToken };
