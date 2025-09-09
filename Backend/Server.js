// Archivo principal del servidor
// Variables
const express=require('express');
const app=express();
const PORT=3000;
const path = require('path');
const cors = require("cors");
const PDFDocument = require('pdfkit');
const { connectDB } = require('./Configuration/db.js');
const session = require("express-session");
const loginRoutes = require("./Rutas/login.js");
const usuarioRoutes = require('./Rutas/Usuarios.js');
const categoriaRoutes = require('./Rutas/Categorias.js');
const marcaRoutes=require('./Rutas/Marcas.js');
const proveedorRoutes=require('./Rutas/Proveedores.js')
const productoRoutes=require('./Rutas/Productos.js')
const adminRoutes = require("./Rutas/admin.js");
const empleadoRoutes = require("./Rutas/empleado.js");
const reporteInventarioRouter = require("./Rutas/reporte_inventario.js");
const cartaRoutes = require('./Rutas/Carta.js');
// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

// El servidor está escuchando
app.listen(PORT, ()=>{
    console.log("Sevidor encendido");
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Probar conexión a base de datos
connectDB(); 

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/pages'));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Permitirá guardar sesiones en memoria
app.use(session({
  secret: "papeleria_super_secreto",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

// Rutas
app.get('/', (req, res) => {
    res.render('general');
});
app.use('/login', loginRoutes);

// Middleware de protección de rutas de logueo
 function authMiddleware(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// Rutas de menú de usuarios
app.use("/admin", adminRoutes);
app.use("/empleado", empleadoRoutes);

//Rutas de funcionalidades
app.use('/usuarios', authMiddleware, usuarioRoutes);
app.use('/categorias', authMiddleware, categoriaRoutes);
app.use('/marcas', authMiddleware, marcaRoutes);
app.use('/proveedores', authMiddleware, proveedorRoutes);
app.use('/productos', authMiddleware, productoRoutes);
app.use('/reporteinventario', authMiddleware, reporteInventarioRouter)
app.use('/carta', authMiddleware, cartaRoutes);





