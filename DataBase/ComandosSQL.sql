-- Tabla Usuario
CREATE TABLE Usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY, 
    nombre VARCHAR(50) NOT NULL,              
    cedula VARCHAR(20) NOT NULL UNIQUE,      
    correo VARCHAR(100) NOT NULL UNIQUE,     
    telefono VARCHAR(15) NOT NULL,                
    contrasena VARCHAR(255) NOT NULL,         
    rol VARCHAR(20) NOT NULL,                 
    estado BIT NOT NULL,                     
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE() 
);

-- Tabla Categoría
CREATE TABLE Categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuarioId INT NOT NULL,
    descripcion VARCHAR(MAX) NULL,
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id_usuario)
);

-- Tabla Marca
CREATE TABLE Marca (
    id_marca INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuarioId INT NOT NULL,
    descripcion VARCHAR(MAX) NULL,
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id_usuario)
);

-- Tabla Proveedor
CREATE TABLE Proveedor (
    id_proveedor INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(100) NULL,
    direccion VARCHAR(200) NULL,
    usuarioId INT NOT NULL,
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id_usuario)
);

-- Tabla Producto
CREATE TABLE Producto (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    categoriaId INT NOT NULL,
    marcaId INT NOT NULL,
    proveedorId INT NOT NULL,
    usuarioId INT NOT NULL,
    url_imagen NVARCHAR(1000) NOT NULL DEFAULT '',
    usuario_ultima_modificacion VARCHAR(1000) NULL,
    fecha_ultima_modificacion   DATETIME2 NULL,
    FOREIGN KEY (categoriaId) REFERENCES Categoria(id_categoria),
    FOREIGN KEY (marcaId) REFERENCES Marca(id_marca),
    FOREIGN KEY (proveedorId) REFERENCES Proveedor(id_proveedor),
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id_usuario)
);



-- Tabla Reporte
CREATE TABLE Reporte (
    id_reporte INT IDENTITY(1,1) PRIMARY KEY, 
    tipo VARCHAR(50) NOT NULL,                
    fecha DATETIME NOT NULL,                  
    periodo VARCHAR(50) NOT NULL              
);

-- Tabla Venta
CREATE TABLE Venta (
    id_venta INT PRIMARY KEY IDENTITY,
    fecha DATETIME DEFAULT GETDATE(),
    total DECIMAL(10,2)
);

-- Tabla De Detalles De Venta
CREATE TABLE Detalle_venta (
    id_detalle_venta INT PRIMARY KEY IDENTITY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal AS (cantidad * precio_unitario) PERSISTED,
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- Tabla Compra
CREATE TABLE Compra (
    id_compra INT PRIMARY KEY IDENTITY,
    fecha DATETIME DEFAULT GETDATE(),
    total DECIMAL(10,2)
);

-- Tabla De Detalles De Compra
CREATE TABLE Detalle_compra (
    id_detalle_compra INT PRIMARY KEY IDENTITY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal AS (cantidad * precio_unitario) PERSISTED,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- Tabla De Historial De Inventario
CREATE TABLE Movimiento_inventario (
    id_movimiento INT PRIMARY KEY IDENTITY,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL, -- puede ser + (entrada) o - (salida)
    tipo_movimiento VARCHAR(50) NOT NULL, -- 'venta', 'compra', 'ajuste', etc.
    fecha DATETIME DEFAULT GETDATE(),
    id_detalle_venta INT NULL,
    id_detalle_compra INT NULL,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_detalle_venta) REFERENCES detalle_venta(id_detalle_venta),
    FOREIGN KEY (id_detalle_compra) REFERENCES detalle_compra(id_detalle_compra)
);

-- Tabla De Stock Mínimo
CREATE TABLE Stock_minimo (
    id_stock_minimo INT PRIMARY KEY IDENTITY,
    id_producto INT NOT NULL,
    stock_minimo INT NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);