const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

/* CREAR DETECCIÓN / ANOMALÍA */
router.post("/", async (req, res) => {
    const { latitud, longitud, id_tipo, severidad, id_viaje } = req.body;
    const id_usuario = req.user.id_usuario;

    if (!latitud || !longitud || !id_tipo) {
        return res.status(400).json({ message: "latitud, longitud e id_tipo son obligatorios" });
    }

    try {
        // CONTROL DE DUPLICADOS: buscar anomalía existente en radio de 10 metros
        const duplicado = await db.query(
            `SELECT * FROM anomalias
       WHERE ST_DWithin(
         ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         10
       )
       AND id_tipo = $3
       AND estado != 'resuelto'
       LIMIT 1`,
            [longitud, latitud, id_tipo]
        );

        if (duplicado.rows.length > 0) {
            // Ya existe una anomalía cerca → incrementar confianza
            const existente = duplicado.rows[0];
            const nuevaConfianza = Math.min(existente.confianza + 5, 100);

            await db.query(
                `UPDATE anomalias SET confianza = $1 WHERE id_anomalia = $2`,
                [nuevaConfianza, existente.id_anomalia]
            );

            // Registrar en historial
            await db.query(
                `INSERT INTO historial_anomalia (id_anomalia, accion, id_usuario)
         VALUES ($1, 'validacion', $2)`,
                [existente.id_anomalia, id_usuario]
            );

            // Actualizar estado si tiene suficientes validaciones
            const validaciones = await db.query(
                `SELECT COUNT(*) as total FROM historial_anomalia
         WHERE id_anomalia = $1 AND accion = 'validacion'`,
                [existente.id_anomalia]
            );

            const total = parseInt(validaciones.rows[0].total);
            if (total >= 3 && existente.estado === 'reportado') {
                await db.query(
                    `UPDATE anomalias SET estado = 'confirmado' WHERE id_anomalia = $1`,
                    [existente.id_anomalia]
                );
            }

            return res.json({
                message: "Anomalía existente validada",
                anomalia: { ...existente, confianza: nuevaConfianza },
                nueva: false,
            });
        }

        // NO hay duplicado → crear nueva anomalía
        // Buscar la calle más cercana (si tienes calles cargadas)
        let id_calle = 1; // valor por defecto
        const calleResult = await db.query(
            `SELECT id_calle FROM calles
       WHERE geometria IS NOT NULL
       ORDER BY geometria <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
       LIMIT 1`,
            [longitud, latitud]
        );

        if (calleResult.rows.length > 0) {
            id_calle = calleResult.rows[0].id_calle;
        }

        // Calcular confianza inicial según severidad
        const confianzaInicial = severidad === "severo" ? 60 : severidad === "moderado" ? 45 : 30;

        const result = await db.query(
            `INSERT INTO anomalias (id_tipo, id_calle, origen, confianza, estado, latitud, longitud)
       VALUES ($1, $2, 'sensor', $3, 'reportado', $4, $5)
       RETURNING *`,
            [id_tipo, id_calle, confianzaInicial, latitud, longitud]
        );

        const anomalia = result.rows[0];

        // Registrar en historial
        await db.query(
            `INSERT INTO historial_anomalia (id_anomalia, accion, id_usuario)
       VALUES ($1, 'creacion', $2)`,
            [anomalia.id_anomalia, id_usuario]
        );

        // Actualizar estadísticas del viaje (si viene de un viaje)
        if (id_viaje) {
            await db.query(
                `UPDATE estadisticas_viaje
         SET baches_detectados = baches_detectados + 1
         WHERE id_viaje = $1`,
                [id_viaje]
            );
        }

        // Actualizar estadísticas del usuario
        await db.query(
            `INSERT INTO estadisticas_usuario (id_usuario, total_baches)
       VALUES ($1, 1)
       ON CONFLICT (id_usuario) DO UPDATE
       SET total_baches = estadisticas_usuario.total_baches + 1`,
            [id_usuario]
        );

        res.status(201).json({
            message: "Anomalía creada",
            anomalia,
            nueva: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear detección" });
    }
});

/* INSERCIÓN MASIVA (sincronización offline) — SCRUM-50 */
router.post("/bulk", async (req, res) => {
    const { detecciones, id_viaje } = req.body;
    const id_usuario = req.user.id_usuario;

    if (!detecciones || !Array.isArray(detecciones) || detecciones.length === 0) {
        return res.status(400).json({ message: "Se requiere array 'detecciones'" });
    }

    const resultados = { nuevas: 0, validadas: 0, errores: 0 };
    const t_inicio = Date.now();

    try {
        for (const det of detecciones) {
            const { latitud, longitud, id_tipo, severidad } = det;
            if (!latitud || !longitud || !id_tipo) {
                resultados.errores++;
                continue;
            }

            try {
                const duplicado = await db.query(
                    `SELECT * FROM anomalias
                     WHERE ST_DWithin(
                       ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography,
                       ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                       10
                     )
                     AND id_tipo = $3 AND estado != 'resuelto'
                     LIMIT 1`,
                    [longitud, latitud, id_tipo]
                );

                if (duplicado.rows.length > 0) {
                    const existente = duplicado.rows[0];
                    const nuevaConfianza = Math.min(existente.confianza + 5, 100);
                    await db.query(
                        `UPDATE anomalias SET confianza = $1 WHERE id_anomalia = $2`,
                        [nuevaConfianza, existente.id_anomalia]
                    );
                    await db.query(
                        `INSERT INTO historial_anomalia (id_anomalia, accion, id_usuario)
                         VALUES ($1, 'validacion', $2)`,
                        [existente.id_anomalia, id_usuario]
                    );
                    resultados.validadas++;
                } else {
                    let id_calle = 1;
                    const calleResult = await db.query(
                        `SELECT id_calle FROM calles
                         WHERE geometria IS NOT NULL
                         ORDER BY geometria <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
                         LIMIT 1`,
                        [longitud, latitud]
                    );
                    if (calleResult.rows.length > 0) {
                        id_calle = calleResult.rows[0].id_calle;
                    }

                    const confianzaInicial = severidad === "severo" ? 60 : severidad === "moderado" ? 45 : 30;

                    const result = await db.query(
                        `INSERT INTO anomalias (id_tipo, id_calle, origen, confianza, estado, latitud, longitud)
                         VALUES ($1, $2, 'sensor', $3, 'reportado', $4, $5)
                         RETURNING *`,
                        [id_tipo, id_calle, confianzaInicial, latitud, longitud]
                    );

                    await db.query(
                        `INSERT INTO historial_anomalia (id_anomalia, accion, id_usuario)
                         VALUES ($1, 'creacion', $2)`,
                        [result.rows[0].id_anomalia, id_usuario]
                    );

                    if (id_viaje) {
                        await db.query(
                            `UPDATE estadisticas_viaje
                             SET baches_detectados = baches_detectados + 1
                             WHERE id_viaje = $1`,
                            [id_viaje]
                        );
                    }
                    resultados.nuevas++;
                }
            } catch (err) {
                resultados.errores++;
            }
        }

        await db.query(
            `INSERT INTO estadisticas_usuario (id_usuario, total_baches)
             VALUES ($1, $2)
             ON CONFLICT (id_usuario) DO UPDATE
             SET total_baches = estadisticas_usuario.total_baches + $2`,
            [id_usuario, resultados.nuevas]
        );

        const t_fin = Date.now();
        res.status(201).json({
            message: "Bulk insert completado",
            ...resultados,
            total_procesadas: detecciones.length,
            tiempo_ms: t_fin - t_inicio,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en bulk insert" });
    }
});

/* OBTENER ANOMALÍAS EN VIEWPORT (para el mapa) */
router.get("/viewport", async (req, res) => {
    const { lat_min, lat_max, lng_min, lng_max } = req.query;

    if (!lat_min || !lat_max || !lng_min || !lng_max) {
        return res.status(400).json({ message: "Se requieren lat_min, lat_max, lng_min, lng_max" });
    }

    try {
        const result = await db.query(
            `SELECT a.*, ta.nombre as tipo_nombre,
        (SELECT COUNT(*) FROM historial_anomalia h WHERE h.id_anomalia = a.id_anomalia AND h.accion = 'validacion') as validaciones
       FROM anomalias a
       JOIN tipos_anomalia ta ON a.id_tipo = ta.id_tipo
       WHERE a.latitud BETWEEN $1 AND $2
       AND a.longitud BETWEEN $3 AND $4
       AND a.estado != 'resuelto'
       ORDER BY a.confianza DESC
       LIMIT 200`,
            [lat_min, lat_max, lng_min, lng_max]
        );

        res.json({ anomalias: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener anomalías" });
    }
});

/* OBTENER ANOMALÍAS CERCANAS (para alertas) */
router.get("/nearby", async (req, res) => {
    const { lat, lng, radio } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: "Se requieren lat y lng" });
    }

    const radioMetros = radio || 200; // 200m por defecto

    try {
        const result = await db.query(
            `SELECT a.*, ta.nombre as tipo_nombre,
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
       AND a.estado IN ('reportado', 'confirmado')
       ORDER BY distancia_metros ASC`,
            [lng, lat, radioMetros]
        );

        res.json({ anomalias: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener anomalías cercanas" });
    }
});

/* DETALLE DE UNA ANOMALÍA */
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT a.*, ta.nombre as tipo_nombre, c.nombre as calle_nombre
       FROM anomalias a
       JOIN tipos_anomalia ta ON a.id_tipo = ta.id_tipo
       LEFT JOIN calles c ON a.id_calle = c.id_calle
       WHERE a.id_anomalia = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Anomalía no encontrada" });
        }

        // Obtener historial
        const historial = await db.query(
            `SELECT h.*, u.nombre as usuario_nombre
       FROM historial_anomalia h
       LEFT JOIN usuarios u ON h.id_usuario = u.id_usuario
       WHERE h.id_anomalia = $1
       ORDER BY h.fecha DESC`,
            [id]
        );

        res.json({
            anomalia: result.rows[0],
            historial: historial.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener anomalía" });
    }
});

/* VALIDAR ANOMALÍA (confirmar que sigue ahí) */
router.post("/:id/validate", async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;

    try {
        const anomalia = await db.query(
            "SELECT * FROM anomalias WHERE id_anomalia = $1",
            [id]
        );

        if (anomalia.rows.length === 0) {
            return res.status(404).json({ message: "Anomalía no encontrada" });
        }

        // Verificar que el usuario no haya validado ya
        const yaValido = await db.query(
            `SELECT * FROM historial_anomalia
       WHERE id_anomalia = $1 AND id_usuario = $2 AND accion = 'validacion'`,
            [id, id_usuario]
        );

        if (yaValido.rows.length > 0) {
            return res.status(400).json({ message: "Ya validaste esta anomalía" });
        }

        // Incrementar confianza
        const nuevaConfianza = Math.min(anomalia.rows[0].confianza + 5, 100);

        await db.query(
            "UPDATE anomalias SET confianza = $1 WHERE id_anomalia = $2",
            [nuevaConfianza, id]
        );

        // Registrar validación
        await db.query(
            `INSERT INTO historial_anomalia (id_anomalia, accion, id_usuario)
       VALUES ($1, 'validacion', $2)`,
            [id, id_usuario]
        );

        // Verificar si se debe confirmar (>= 3 validaciones)
        const validaciones = await db.query(
            `SELECT COUNT(*) as total FROM historial_anomalia
       WHERE id_anomalia = $1 AND accion = 'validacion'`,
            [id]
        );

        const total = parseInt(validaciones.rows[0].total);
        let estado = anomalia.rows[0].estado;

        if (total >= 3 && estado === "reportado") {
            estado = "confirmado";
            await db.query(
                "UPDATE anomalias SET estado = 'confirmado' WHERE id_anomalia = $1",
                [id]
            );
        }

        res.json({
            message: "Anomalía validada",
            confianza: nuevaConfianza,
            validaciones: total,
            estado,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al validar anomalía" });
    }
});

/* MARCAR COMO RESUELTO */
router.post("/:id/resolve", async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;

    try {
        const anomalia = await db.query(
            "SELECT * FROM anomalias WHERE id_anomalia = $1",
            [id]
        );

        if (anomalia.rows.length === 0) {
            return res.status(404).json({ message: "Anomalía no encontrada" });
        }

        await db.query(
            "UPDATE anomalias SET estado = 'resuelto' WHERE id_anomalia = $1",
            [id]
        );

        await db.query(
            `INSERT INTO historial_anomalia (id_anomalia, accion, id_usuario)
       VALUES ($1, 'resolucion', $2)`,
            [id, id_usuario]
        );

        res.json({ message: "Anomalía marcada como resuelta" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al resolver anomalía" });
    }
});

/* REPORTE MANUAL (con descripción) */
router.post("/report", async (req, res) => {
    const { latitud, longitud, id_tipo, descripcion } = req.body;
    const id_usuario = req.user.id_usuario;

    if (!latitud || !longitud || !id_tipo) {
        return res.status(400).json({ message: "latitud, longitud e id_tipo son obligatorios" });
    }

    try {
        let id_calle = 1;
        const calleResult = await db.query(
            `SELECT id_calle FROM calles
       WHERE geometria IS NOT NULL
       ORDER BY geometria <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
       LIMIT 1`,
            [longitud, latitud]
        );

        if (calleResult.rows.length > 0) {
            id_calle = calleResult.rows[0].id_calle;
        }

        const result = await db.query(
            `INSERT INTO anomalias (id_tipo, id_calle, origen, confianza, estado, latitud, longitud)
       VALUES ($1, $2, 'manual', 40, 'reportado', $3, $4)
       RETURNING *`,
            [id_tipo, id_calle, latitud, longitud]
        );

        const anomalia = result.rows[0];

        await db.query(
            `INSERT INTO historial_anomalia (id_anomalia, accion, id_usuario)
       VALUES ($1, 'creacion', $2)`,
            [anomalia.id_anomalia, id_usuario]
        );

        res.status(201).json({ anomalia });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear reporte" });
    }
});

module.exports = router;