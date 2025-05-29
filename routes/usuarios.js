const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../app');
const { verificarToken } = require('../middleware/auth');

// Obtener perfil del usuario
router.get('/perfil', verificarToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre, correo, rol FROM usuarios WHERE id = $1',
            [req.usuario.usuario.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ mensaje: 'Error al obtener el perfil' });
    }
});

// Actualizar perfil
router.put('/actualizar', verificarToken, async (req, res) => {
    const { nombre } = req.body;

    try {
        await pool.query(
            'UPDATE usuarios SET nombre = $1 WHERE id = $2',
            [nombre, req.usuario.usuario.id]
        );

        res.json({ mensaje: 'Perfil actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el perfil' });
    }
});

// Actualizar contraseña
router.post('/actualizar-password', verificarToken, async (req, res) => {
    const { correo, passwordActual, passwordNueva } = req.body;

    try {
        // Verificar que el usuario existe
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1',
            [correo]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = result.rows[0];

        // Verificar que la contraseña actual es correcta
        const passwordValido = await bcrypt.compare(passwordActual, usuario.password);
        if (!passwordValido) {
            return res.status(400).json({ mensaje: 'Contraseña actual incorrecta' });
        }

        // Verificar que la nueva contraseña tenga al menos 8 caracteres
        if (passwordNueva.length < 8) {
            return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 8 caracteres' });
        }

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptado = await bcrypt.hash(passwordNueva, salt);

        // Actualizar la contraseña
        await pool.query(
            'UPDATE usuarios SET password = $1 WHERE correo = $2',
            [passwordEncriptado, correo]
        );

        res.json({ mensaje: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ mensaje: 'Error al actualizar la contraseña' });
    }
});

module.exports = router; 