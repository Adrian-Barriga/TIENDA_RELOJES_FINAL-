const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../app');
const { verificarToken } = require('../middleware/auth');

// Registro de usuario
router.post('/registro', async (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        const usuarioExiste = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1',
            [correo]
        );

        if (usuarioExiste.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El usuario ya existe' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptado = await bcrypt.hash(password, salt);

        // Insertar nuevo usuario
        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre, correo, password, rol) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, correo, passwordEncriptado, rol]
        );

        // Crear y devolver token
        const payload = {
            usuario: {
                id: nuevoUsuario.rows[0].id,
                rol: nuevoUsuario.rows[0].rol
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        // Verificar si el usuario existe
        const usuario = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1',
            [correo]
        );

        if (usuario.rows.length === 0) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.rows[0].password);

        if (!passwordValido) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        // Crear y devolver token
        const payload = {
            usuario: {
                id: usuario.rows[0].id,
                rol: usuario.rows[0].rol
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

// Verificar token y obtener información del usuario
router.get('/verificar', verificarToken, async (req, res) => {
    try {
        const usuario = await pool.query(
            'SELECT id, nombre, correo, rol FROM usuarios WHERE id = $1',
            [req.usuario.usuario.id]
        );

        if (usuario.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json({ 
            usuario: usuario.rows[0],
            mensaje: 'Token válido' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

module.exports = router; 