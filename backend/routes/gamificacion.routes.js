const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

/* LISTAR TODOS LOS BADGES + CUÁLES TIENE EL USUARIO */
router.get("/badges", async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        const result = await db.query(
            `SELECT l.*,
        CASE WHEN lu.id IS NOT NULL THEN true ELSE false END as obtenido,
        lu.fecha as fecha_obtenido
       FROM logros l
       LEFT JOIN logros_usuario lu ON l.id_logro = lu.id_logro AND lu.id_usuario = $1
       ORDER BY l.puntos ASC`,
            [id_usuario]
        );

        res.json({ badges: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener badges" });
    }
});

/* VERIFICAR Y OTORGAR BADGES AUTOMÁTICAMENTE */
router.post("/check-badges", async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        // Contar detecciones del usuario
        const detecciones = await db.query(
            `SELECT COUNT(*) as total FROM historial_anomalia
       WHERE id_usuario = $1 AND accion = 'creacion'`,
            [id_usuario]
        );
        const totalDetecciones = parseInt(detecciones.rows[0].total);

        // Contar validaciones
        const validaciones = await db.query(
            `SELECT COUNT(*) as total FROM historial_anomalia
       WHERE id_usuario = $1 AND accion = 'validacion'`,
            [id_usuario]
        );
        const totalValidaciones = parseInt(validaciones.rows[0].total);

        // Definir reglas de badges
        const badgeRules = [
            { nombre: "Primer Impacto", condicion: totalDetecciones >= 1 },
            { nombre: "Explorador", condicion: totalDetecciones >= 10 },
            { nombre: "Guardián Vial", condicion: totalDetecciones >= 100 },
            { nombre: "Leyenda", condicion: totalDetecciones >= 500 },
            { nombre: "Validador", condicion: totalValidaciones >= 10 },
            { nombre: "Colaborador", condicion: totalValidaciones >= 50 },
        ];

        const badgesOtorgados = [];

        for (const rule of badgeRules) {
            if (rule.condicion) {
                // Buscar si el badge existe en la tabla logros
                const logro = await db.query(
                    "SELECT id_logro FROM logros WHERE nombre = $1",
                    [rule.nombre]
                );

                if (logro.rows.length > 0) {
                    // Verificar si ya lo tiene
                    const yaLo = await db.query(
                        "SELECT id FROM logros_usuario WHERE id_usuario = $1 AND id_logro = $2",
                        [id_usuario, logro.rows[0].id_logro]
                    );

                    if (yaLo.rows.length === 0) {
                        // Otorgar badge
                        await db.query(
                            "INSERT INTO logros_usuario (id_usuario, id_logro) VALUES ($1, $2)",
                            [id_usuario, logro.rows[0].id_logro]
                        );

                        // Sumar puntos al usuario
                        const puntosLogro = await db.query(
                            "SELECT puntos FROM logros WHERE id_logro = $1",
                            [logro.rows[0].id_logro]
                        );

                        await db.query(
                            "UPDATE usuarios SET puntos = puntos + $1 WHERE id_usuario = $2",
                            [puntosLogro.rows[0].puntos, id_usuario]
                        );

                        badgesOtorgados.push(rule.nombre);
                    }
                }
            }
        }

        res.json({
            message: badgesOtorgados.length > 0
                ? `¡Nuevos badges obtenidos: ${badgesOtorgados.join(", ")}!`
                : "No hay badges nuevos por ahora",
            nuevos_badges: badgesOtorgados,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al verificar badges" });
    }
});

/* RANKING / LEADERBOARD */
router.get("/ranking", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id_usuario, u.nombre, u.username, u.nivel, u.puntos,
        (SELECT COUNT(*) FROM logros_usuario lu WHERE lu.id_usuario = u.id_usuario) as total_badges
       FROM usuarios u
       ORDER BY u.puntos DESC
       LIMIT 50`
        );

        res.json({ ranking: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener ranking" });
    }
});

/* PUNTOS DEL USUARIO */
router.get("/points", async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        const user = await db.query(
            "SELECT puntos, nivel FROM usuarios WHERE id_usuario = $1",
            [id_usuario]
        );

        const badges = await db.query(
            "SELECT COUNT(*) as total FROM logros_usuario WHERE id_usuario = $1",
            [id_usuario]
        );

        // Posición en ranking
        const posicion = await db.query(
            `SELECT COUNT(*) + 1 as posicion FROM usuarios
       WHERE puntos > (SELECT puntos FROM usuarios WHERE id_usuario = $1)`,
            [id_usuario]
        );

        res.json({
            puntos: user.rows[0].puntos,
            nivel: user.rows[0].nivel,
            total_badges: parseInt(badges.rows[0].total),
            posicion_ranking: parseInt(posicion.rows[0].posicion),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener puntos" });
    }
});

module.exports = router;