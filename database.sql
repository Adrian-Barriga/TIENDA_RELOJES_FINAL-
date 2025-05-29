CREATE DATABASE time_store
    
/*
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS carrito CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;*/

-- Agregar campo estado a la tabla usuarios si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN estado VARCHAR(20) CHECK (estado IN ('activo', 'inactivo')) DEFAULT 'activo';
    END IF;
END $$;

-- Crear tablas
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('administrador', 'comprador')) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('activo', 'inactivo')) DEFAULT 'activo',
    telefono VARCHAR(20),
    direccion TEXT
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    imagen_url TEXT
);

CREATE TABLE carrito (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id),
    id_producto INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    UNIQUE(id_usuario, id_producto)
);

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial_navegacion (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id),
    pagina VARCHAR(255) NOT NULL,
    accion VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles JSONB
);

-- Actualizar el estado de todos los usuarios a 'activo' (temporalmente para diagnóstico)
UPDATE usuarios SET estado = 'activo';

-- Insertar datos de ejemplo con contraseña simple (123456)
INSERT INTO usuarios (nombre, correo, password, rol, estado) VALUES
('Admin Usuario', 'admin@timestore.com', '$2a$10$GlsGSNhkbVon6ZOSNMptOu5RikedRzlCAhMa7YpxmnnP.LAKSHOie', 'administrador', 'activo'),
('Cliente Demo', 'cliente@ejemplo.com', '$2a$10$GlsGSNhkbVon6ZOSNMptOu5RikedRzlCAhMa7YpxmnnP.LAKSHOie', 'comprador', 'activo');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url) VALUES
('Reloj Clásico Elite', 'Reloj analógico con correa de cuero genuino', 299.99, 50, '/images/reloj-clasico.jpg'),
('Smartwatch Pro', 'Reloj inteligente con monitor cardíaco y GPS', 499.99, 30, '/images/smartwatch.jpg'),
('Reloj Deportivo X-treme', 'Resistente al agua hasta 100m, ideal para deportes', 199.99, 40, '/images/reloj-deportivo.jpg'); 
