const { pool } = require('../app');

const registrarNavegacion = async (req, res, next) => {
    if (!req.usuario || !req.usuario.usuario) {
        return next();
    }

    try {
        // Obtener la página actual y la acción
        const pagina = req.path;
        const accion = req.method;
        const detalles = {
            query: req.query,
            params: req.params,
            body: req.body
        };

        // Registrar la navegación
        await pool.query(
            'INSERT INTO historial_navegacion (id_usuario, pagina, accion, detalles) VALUES ($1, $2, $3, $4)',
            [req.usuario.usuario.id, pagina, accion, detalles]
        );
    } catch (error) {
        console.error('Error al registrar navegación:', error);
    }
    next();
};

module.exports = {
    registrarNavegacion
}; 