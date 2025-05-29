const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ mensaje: 'No hay token, acceso denegado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        res.status(401).json({ mensaje: 'Token no válido' });
    }
};

const esAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.usuario && req.usuario.usuario.rol === 'administrador') {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso denegado - Se requieren permisos de administrador' });
    }
};

const esComprador = (req, res, next) => {
    // Permitir que cualquier usuario autenticado pueda usar el carrito
    if (req.usuario && req.usuario.usuario) {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso denegado - Debe iniciar sesión' });
    }
};

const esAdminOVendedor = (req, res, next) => {
    if (
        req.usuario && req.usuario.usuario &&
        (req.usuario.usuario.rol === 'administrador' || req.usuario.usuario.rol === 'vendedor')
    ) {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso denegado - Se requieren permisos de administrador o vendedor' });
    }
};

module.exports = {
    verificarToken,
    esAdmin,
    esComprador,
    esAdminOVendedor
}; 