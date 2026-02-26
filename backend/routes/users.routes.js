const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

/* OBTENER PERFIL COMPLETO */
router.get("/profile", async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        const userResult = await db.query(
            "SELECT id_usuario, email, nombre, username, nivel, puntos, fecha_registro FROM usuarios WHERE id_usuario = $1",
            [id_usuario]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Estadísticas
        const statsResult = await db.query(
            "SELECT * FROM estadisticas_usuario WHERE id_usuario = $1",
            [id_usuario]
        );

        // Estadísticas por tipo de anomalía
        const statsTipoResult = await db.query(
            `SELECT et.*, ta.nombre as tipo_nombre
       FROM estadisticas_por_tipo et
       JOIN tipos_anomalia ta ON et.id_tipo = ta.id_tipo
       WHERE et.id_usuario = $1`,
            [id_usuario]
        );

        // Vehículos
        const vehiculosResult = await db.query(
            "SELECT * FROM vehiculos WHERE id_usuario = $1",
            [id_usuario]
        );

        res.json({
            user: userResult.rows[0],
            estadisticas: statsResult.rows[0] || { total_viajes: 0, total_baches: 0, total_evitas: 0, dinero_ahorrado_estimado: 0 },
            estadisticas_por_tipo: statsTipoResult.rows,
            vehiculos: vehiculosResult.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener perfil" });
    }
});

/* ACTUALIZAR PERFIL */
router.put("/profile", async (req, res) => {
    const id_usuario = req.user.id_usuario;
    const { nombre, username, avatar_url } = req.body;

    try {
        // Si quiere cambiar username, verificar que no esté en uso
        if (username) {
            const usernameCheck = await db.query(
                "SELECT id_usuario FROM usuarios WHERE username = $1 AND id_usuario != $2",
                [username, id_usuario]
            );
            if (usernameCheck.rows.length > 0) {
                return res.status(400).json({ message: "Ese username ya está en uso" });
            }
        }

        const result = await db.query(
            `UPDATE usuarios
       SET nombre = COALESCE($1, nombre),
           username = COALESCE($2, username),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id_usuario = $4
       RETURNING id_usuario, email, nombre, username, nivel, puntos, avatar_url`,
            [nombre, username, avatar_url, id_usuario]
        );

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar perfil" });
    }
});

/* ESTADÍSTICAS DEL USUARIO */
router.get("/stats", async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        // Stats generales
        const stats = await db.query(
            "SELECT * FROM estadisticas_usuario WHERE id_usuario = $1",
            [id_usuario]
        );

        // Total de viajes reales
        const viajes = await db.query(
            "SELECT COUNT(*) as total FROM viajes WHERE id_usuario = $1 AND fin_timestamp IS NOT NULL",
            [id_usuario]
        );

        // Total de anomalías reportadas por este usuario
        const anomalias = await db.query(
            `SELECT COUNT(*) as total FROM historial_anomalia
       WHERE id_usuario = $1 AND accion = 'creacion'`,
            [id_usuario]
        );

        // Total de validaciones hechas
        const validaciones = await db.query(
            `SELECT COUNT(*) as total FROM historial_anomalia
       WHERE id_usuario = $1 AND accion = 'validacion'`,
            [id_usuario]
        );

        res.json({
            estadisticas: stats.rows[0] || { total_viajes: 0, total_baches: 0, total_evitas: 0, dinero_ahorrado_estimado: 0 },
            viajes_completados: parseInt(viajes.rows[0].total),
            anomalias_reportadas: parseInt(anomalias.rows[0].total),
            validaciones_hechas: parseInt(validaciones.rows[0].total),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener estadísticas" });
    }
});

/* HISTORIAL DE CONTRIBUCIONES */
router.get("/contributions", async (req, res) => {
    const id_usuario = req.user.id_usuario;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await db.query(
            `SELECT h.*, a.latitud, a.longitud, a.estado, a.confianza, ta.nombre as tipo_nombre
       FROM historial_anomalia h
       JOIN anomalias a ON h.id_anomalia = a.id_anomalia
       JOIN tipos_anomalia ta ON a.id_tipo = ta.id_tipo
       WHERE h.id_usuario = $1
       ORDER BY h.fecha DESC
       LIMIT $2 OFFSET $3`,
            [id_usuario, limit, offset]
        );

        const countResult = await db.query(
            "SELECT COUNT(*) as total FROM historial_anomalia WHERE id_usuario = $1",
            [id_usuario]
        );

        res.json({
            contribuciones: result.rows,
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            totalPages: Math.ceil(countResult.rows[0].total / limit),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener contribuciones" });
    }
});

module.exports = router;