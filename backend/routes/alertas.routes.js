const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const premiumMiddleware = require("../middleware/premiumMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(premiumMiddleware);

/* OBTENER ALERTAS CERCANAS (distancia según tier) */
router.get("/check", async (req, res) => {
    const { lat, lng } = req.query;
    const isPremium = req.isPremium;

    if (!lat || !lng) {
        return res.status(400).json({ message: "Se requieren lat y lng" });
    }

    // Radio: 200m gratis, 500m premium
    const radio = isPremium ? 500 : 200;

    try {
        const result = await db.query(
            `SELECT a.id_anomalia, a.latitud, a.longitud, a.confianza, a.estado,
        ta.nombre as tipo_nombre,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(a.longitud, a.latitud), 4326)::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distancia_metros
       FROM anomalias a
       JOIN tipos_anomalia ta ON a.id_tipo = ta.id_tipo
       WHERE ST_DWithin(
         ST_SetSRID(ST_MakePoint(a.longitud, a.latitud), 4326)::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $3
       )
       AND a.estado IN ('confirmado')
       AND a.confianza >= 50
       ORDER BY distancia_metros ASC
       LIMIT 10`,
            [lng, lat, radio]
        );

        // Generar mensajes de alerta
        const alertas = result.rows.map((a) => ({
            id_anomalia: a.id_anomalia,
            tipo: a.tipo_nombre,
            distancia: Math.round(a.distancia_metros),
            mensaje: `${a.tipo_nombre} a ${Math.round(a.distancia_metros)} metros`,
            confianza: a.confianza,
        }));

        res.json({
            alertas,
            radio_metros: radio,
            isPremium,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al verificar alertas" });
    }
});

/* GUARDAR ALERTA DE VOZ EMITIDA (para estadísticas) */
router.post("/log", async (req, res) => {
    const { id_anomalia, mensaje, distancia_metros } = req.body;

    if (!id_anomalia || !mensaje || !distancia_metros) {
        return res.status(400).json({ message: "Campos obligatorios: id_anomalia, mensaje, distancia_metros" });
    }

    try {
        const result = await db.query(
            `INSERT INTO alertas_voz (id_anomalia, mensaje, distancia_metros)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [id_anomalia, mensaje, distancia_metros]
        );

        res.status(201).json({ alerta: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar alerta" });
    }
});

module.exports = router;