-- Tabla Usuario
CREATE TABLE Usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY, 
    nombre VARCHAR(50) NOT NULL,              
    cedula VARCHAR(20) NOT NULL UNIQUE,      
    correo VARCHAR(100) NOT NULL UNIQUE,     
    telefono VARCHAR(15) NULL,                
    contraseña VARCHAR(255) NOT NULL,         
    rol VARCHAR(20) NOT NULL,                 
    estado BIT NOT NULL,                     
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE() 
);

-- Tabla Categoría
CREATE TABLE Categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuarioId INT NOT NULL,
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id_usuario)
);

-- Tabla Marca
CREATE TABLE Marca (
    id_marca INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuarioId INT NOT NULL,
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
    FOREIGN KEY (categoriaId) REFERENCES Categoria(id_categoria),
    FOREIGN KEY (marcaId) REFERENCES Marca(id_marca),
    FOREIGN KEY (proveedorId) REFERENCES Proveedor(id_proveedor),
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id_usuario)
);

-- Tabla Inventario
CREATE TABLE Inventario (
    productos VARCHAR(8000) NOT NULL, 
    historial TEXT NOT NULL,          
    stockMinimo INT NOT NULL,         
    fechaActualizacion DATETIME NOT NULL 
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
    id_venta INT IDENTITY(1,1) PRIMARY KEY,   
    productos VARCHAR(8000) NOT NULL,         
    fecha DATETIME NOT NULL                   
);

-- Tabla Factura
CREATE TABLE Factura (
    id_factura INT IDENTITY(1,1) PRIMARY KEY, 
    venta INT NOT NULL,                        
    fecha DATETIME NOT NULL,                   
    subtotal DECIMAL(10,2) NOT NULL,          
    impuestos DECIMAL(10,2) NOT NULL,        
    descuentos DECIMAL(10,2) NULL,            
    total DECIMAL(10,2) NOT NULL,             
    nombreCliente VARCHAR(100) NOT NULL,      
    cedulaCliente VARCHAR(20) NOT NULL,       
    CONSTRAINT FK_Factura_Venta FOREIGN KEY (venta)
        REFERENCES Venta(id_venta)
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);