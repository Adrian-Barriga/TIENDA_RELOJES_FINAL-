const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const { registrarNavegacion } = require('./middleware/historial');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));

app.use(express.json());
app.use(express.static('public'));

// Configuración de la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Verificar conexión a la base de datos
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error al conectar a la base de datos:', err);
    }
    console.log('Conexión exitosa a la base de datos');
    release();
});

// Exportar pool para usar en otros archivos
module.exports.pool = pool;

// Middleware de historial
app.use(registrarNavegacion);

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/carrito', require('./routes/carrito'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/historial', require('./routes/historial'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Ruta para servir la aplicación frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 