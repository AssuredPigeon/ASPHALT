const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/* REGISTRAR VEHÍCULO */
router.post("/", async (req, res) => {
    const { marca, modelo, año, tipo_suspension } = req.body;
    const id_usuario = req.user.id_usuario;

    if (!marca || !modelo || !año || !tipo_suspension) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    try {
        const result = await db.query(
            `INSERT INTO vehiculos (id_usuario, marca, modelo, año, tipo_suspension)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [id_usuario, marca, modelo, año, tipo_suspension]
        );

        res.status(201).json({ vehiculo: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar vehículo" });
    }
});

/* LISTAR VEHÍCULOS DEL USUARIO */
router.get("/", async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
        const result = await db.query(
            "SELECT * FROM vehiculos WHERE id_usuario = $1 ORDER BY id_vehiculo DESC",
            [id_usuario]
        );

        res.json({ vehiculos: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener vehículos" });
    }
});

/* OBTENER UN VEHÍCULO POR ID */
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;

    try {
        const result = await db.query(
            "SELECT * FROM vehiculos WHERE id_vehiculo = $1 AND id_usuario = $2",
            [id, id_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }

        res.json({ vehiculo: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener vehículo" });
    }
});

/* EDITAR VEHÍCULO */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;
    const { marca, modelo, año, tipo_suspension } = req.body;

    try {
        // Verificar que el vehículo pertenece al usuario
        const check = await db.query(
            "SELECT * FROM vehiculos WHERE id_vehiculo = $1 AND id_usuario = $2",
            [id, id_usuario]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }

        const result = await db.query(
            `UPDATE vehiculos
       SET marca = $1, modelo = $2, año = $3, tipo_suspension = $4
       WHERE id_vehiculo = $5 AND id_usuario = $6
       RETURNING *`,
            [marca, modelo, año, tipo_suspension, id, id_usuario]
        );

        res.json({ vehiculo: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar vehículo" });
    }
});

/* ELIMINAR VEHÍCULO */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;

    try {
        const result = await db.query(
            "DELETE FROM vehiculos WHERE id_vehiculo = $1 AND id_usuario = $2 RETURNING *",
            [id, id_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }

        res.json({ message: "Vehículo eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar vehículo" });
    }
});

module.exports = router;