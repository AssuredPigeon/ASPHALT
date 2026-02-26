const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

/* OBTENER CALLES EN VIEWPORT CON GEOMETRÍA */
router.get("/viewport", async (req, res) => {
    const { south, north, west, east, limit = 500, simplify } = req.query;

    if (!south || !north || !west || !east) {
        return res.status(400).json({
            message: "Se requieren south, north, west, east"
        });
    }

    // Nivel de simplificación basado en el zoom
    // simplify alto = zoom lejano, simplify bajo = zoom cercano
    const tolerance = parseFloat(simplify) || 0;

    try {
        const geomExpr = tolerance > 0
            ? `ST_AsGeoJSON(ST_Simplify(c.geometria, ${tolerance}))::json`
            : `ST_AsGeoJSON(c.geometria)::json`;

        const result = await db.query(
            `SELECT 
                c.id_calle,
                c.nombre AS calle_nombre,
                COALESCE(ec.indice_calidad, 100) AS indice_calidad,
                COALESCE(ec.fecha_actualizacion, NOW()) AS fecha_actualizacion,
                ${geomExpr} AS geojson
             FROM calles c
             LEFT JOIN estado_calle ec ON c.id_calle = ec.id_calle
             WHERE c.geometria && ST_MakeEnvelope($1, $2, $3, $4, 4326)
             LIMIT $5`,
            [west, south, east, north, parseInt(limit)]
        );

        const calles = result.rows
            .filter(row => row.geojson && row.geojson.coordinates && row.geojson.coordinates.length >= 2)
            .map(row => ({
                id_calle: row.id_calle,
                calle_nombre: row.calle_nombre,
                indice_calidad: row.indice_calidad.toString(),
                fecha_actualizacion: row.fecha_actualizacion,
                coordinates: row.geojson.coordinates.map(([lng, lat]) => ({
                    lat,
                    lng,
                })),
            }));

        res.json({ calles, total: calles.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener calles en viewport" });
    }
});

/* OBTENER ESTADO DE UNA CALLE */
router.get("/:id/estado", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT ec.*, c.nombre as calle_nombre
       FROM estado_calle ec
       JOIN calles c ON ec.id_calle = c.id_calle
       WHERE ec.id_calle = $1
       ORDER BY ec.fecha_actualizacion DESC
       LIMIT 1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.json({ estado: null, message: "Sin datos de calidad para esta calle" });
        }

        res.json({ estado: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener estado de calle" });
    }
});

/* LISTAR CALLES CON PEOR ESTADO */
router.get("/ranking/peores", async (req, res) => {
    const { limit = 20 } = req.query;

    try {
        const result = await db.query(
            `SELECT DISTINCT ON (ec.id_calle) ec.*, c.nombre as calle_nombre,
        (SELECT COUNT(*) FROM anomalias a WHERE a.id_calle = ec.id_calle AND a.estado != 'resuelto') as anomalias_activas
       FROM estado_calle ec
       JOIN calles c ON ec.id_calle = c.id_calle
       ORDER BY ec.id_calle, ec.fecha_actualizacion DESC`,
            []
        );

        // Ordenar por índice de calidad (menor = peor)
        const sorted = result.rows.sort((a, b) => a.indice_calidad - b.indice_calidad);

        res.json({ calles: sorted.slice(0, parseInt(limit)) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener ranking de calles" });
    }
});

/* RECALCULAR CALIDAD DE UNA CALLE (basado en anomalías) */
router.post("/:id/recalcular", async (req, res) => {
    const { id } = req.params;

    try {
        // Contar anomalías activas en la calle
        const anomalias = await db.query(
            `SELECT COUNT(*) as total,
        AVG(confianza) as confianza_promedio
       FROM anomalias
       WHERE id_calle = $1 AND estado != 'resuelto'`,
            [id]
        );

        const total = parseInt(anomalias.rows[0].total);
        // Fórmula: 100 - (cantidad de anomalías * factor)
        // Más anomalías = peor calidad
        const indice = Math.max(0, Math.min(100, 100 - (total * 10)));

        // Insertar o actualizar estado
        await db.query(
            `INSERT INTO estado_calle (id_calle, indice_calidad)
       VALUES ($1, $2)`,
            [id, indice]
        );

        res.json({
            id_calle: parseInt(id),
            indice_calidad: indice,
            anomalias_activas: total,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al recalcular calidad" });
    }
});

/* OBTENER SUPERFICIE DE UNA CALLE */
router.get("/:id/superficie", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            `SELECT c.id_calle, c.nombre, ts.nombre as tipo_superficie
             FROM calles c
             JOIN tipos_superficie ts ON c.tipo_superficie = ts.id_tipo
             WHERE c.id_calle = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Calle no encontrada" });
        }
        res.json({ calle: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener superficie" });
    }
});

module.exports = router;