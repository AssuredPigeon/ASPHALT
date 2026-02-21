const db = require("../db");

async function premiumMiddleware(req, res, next) {
    const id_usuario = req.user.id_usuario;

    try {
        const result = await db.query(
            "SELECT nivel FROM usuarios WHERE id_usuario = $1",
            [id_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // nivel >= 2 = premium (puedes ajustar la lógica después)
        req.isPremium = result.rows[0].nivel >= 2;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al verificar premium" });
    }
}

module.exports = premiumMiddleware;