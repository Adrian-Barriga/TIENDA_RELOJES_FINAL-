const express = require('express');
const router = express.Router();
const { pool } = require('../app');
const { verificarToken } = require('../middleware/auth');

// Registrar navegación
router.post('/', verificarToken, async (req, res) => {
    const { pagina, accion, detalles } = req.body;
    const id_usuario = req.usuario.usuario.id;

    try {
        await pool.query(
            'INSERT INTO historial_navegacion (id_usuario, pagina, accion, detalles) VALUES ($1, $2, $3, $4)',
            [id_usuario, pagina, accion, detalles]
        );
        res.json({ mensaje: 'Navegación registrada exitosamente' });
    } catch (error) {
        console.error('Error al registrar navegación:', error);
        res.status(500).json({ mensaje: 'Error al registrar la navegación' });
    }
});

// Obtener historial de navegación
router.get('/', verificarToken, async (req, res) => {
    const id_usuario = req.usuario.usuario.id;

    try {
        const result = await pool.query(
            'SELECT * FROM historial_navegacion WHERE id_usuario = $1 ORDER BY fecha DESC',
            [id_usuario]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ mensaje: 'Error al obtener el historial' });
    }
});

module.exports = router; 