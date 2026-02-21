const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

/* INICIAR VIAJE */
router.post("/", async (req, res) => {
    const { id_vehiculo } = req.body;
    const id_usuario = req.user.id_usuario;

    if (!id_vehiculo) {
        return res.status(400).json({ message: "id_vehiculo es obligatorio" });
    }

    try {
        // Verificar que el vehículo pertenece al usuario
        const vehiculo = await db.query(
            "SELECT * FROM vehiculos WHERE id_vehiculo = $1 AND id_usuario = $2",
            [id_vehiculo, id_usuario]
        );

        if (vehiculo.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }

        // Verificar que no tenga un viaje activo (sin fin_timestamp)
        const viajeActivo = await db.query(
            "SELECT * FROM viajes WHERE id_usuario = $1 AND fin_timestamp IS NULL",
            [id_usuario]
        );

        if (viajeActivo.rows.length > 0) {
            return res.status(400).json({
                message: "Ya tienes un viaje activo",
                viaje: viajeActivo.rows[0],
            });
        }

        const result = await db.query(
            `INSERT INTO viajes (id_usuario, id_vehiculo)
       VALUES ($1, $2)
       RETURNING *`,
            [id_usuario, id_vehiculo]
        );

        // Crear registro de estadísticas del viaje
        await db.query(
            `INSERT INTO estadisticas_viaje (id_viaje)
       VALUES ($1)`,
            [result.rows[0].id_viaje]
        );

        res.status(201).json({ viaje: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al iniciar viaje" });
    }
});

/* TERMINAR VIAJE */
router.put("/:id/end", async (req, res) => {
    const { id } = req.params;
    const { distancia_km } = req.body;
    const id_usuario = req.user.id_usuario;

    try {
        const viaje = await db.query(
            "SELECT * FROM viajes WHERE id_viaje = $1 AND id_usuario = $2",
            [id, id_usuario]
        );

        if (viaje.rows.length === 0) {
            return res.status(404).json({ message: "Viaje no encontrado" });
        }

        if (viaje.rows[0].fin_timestamp) {
            return res.status(400).json({ message: "Este viaje ya fue finalizado" });
        }

        const result = await db.query(
            `UPDATE viajes
       SET fin_timestamp = CURRENT_TIMESTAMP, distancia_km = $1
       WHERE id_viaje = $2 AND id_usuario = $3
       RETURNING *`,
            [distancia_km || 0, id, id_usuario]
        );

        // Actualizar estadísticas del usuario (total_viajes)
        await db.query(
            `UPDATE estadisticas_usuario
       SET total_viajes = total_viajes + 1
       WHERE id_usuario = $1`,
            [id_usuario]
        );

        res.json({ viaje: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al finalizar viaje" });
    }
});

/* OBTENER VIAJE ACTIVO */
router.get("/active", async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        const result = await db.query(
            `SELECT v.*, ve.marca, ve.modelo
       FROM viajes v
       JOIN vehiculos ve ON v.id_vehiculo = ve.id_vehiculo
       WHERE v.id_usuario = $1 AND v.fin_timestamp IS NULL`,
            [id_usuario]
        );

        if (result.rows.length === 0) {
            return res.json({ viaje: null });
        }

        res.json({ viaje: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener viaje activo" });
    }
});

/* HISTORIAL DE VIAJES */
router.get("/", async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        const result = await db.query(
            `SELECT v.*, ve.marca, ve.modelo, ev.baches_detectados, ev.baches_evitados, ev.alertas_emitidas
       FROM viajes v
       JOIN vehiculos ve ON v.id_vehiculo = ve.id_vehiculo
       LEFT JOIN estadisticas_viaje ev ON v.id_viaje = ev.id_viaje
       WHERE v.id_usuario = $1
       ORDER BY v.inicio_timestamp DESC`,
            [id_usuario]
        );

        res.json({ viajes: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener historial" });
    }
});

/* DETALLE DE UN VIAJE */
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;

    try {
        const result = await db.query(
            `SELECT v.*, ve.marca, ve.modelo, ev.baches_detectados, ev.baches_evitados, ev.alertas_emitidas
       FROM viajes v
       JOIN vehiculos ve ON v.id_vehiculo = ve.id_vehiculo
       LEFT JOIN estadisticas_viaje ev ON v.id_viaje = ev.id_viaje
       WHERE v.id_viaje = $1 AND v.id_usuario = $2`,
            [id, id_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Viaje no encontrado" });
        }

        res.json({ viaje: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener viaje" });
    }
});

module.exports = router;