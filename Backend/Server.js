// Archivo principal del servidor
// Variables
const express=require('express');
const app=express();
const PORT=3000;
const path = require('path');
const cors = require("cors");
const { connectDB } = require('./Configuration/db.js');
const session = require("express-session");
const loginRoutes = require("./Rutas/login.js");
const usuarioRoutes = require('./Rutas/Usuarios.js');
const adminRoutes = require("./Rutas/admin.js");
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
    res.send('Hola mundo');
});
app.use('/login', loginRoutes);

// Middleware de protección de rutas de logueo
 function authMiddleware(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}
// Ruta de menú del administrador 
app.use("/admin", adminRoutes);
//Rutas del CRUD de usuarios
app.use('/usuarios', authMiddleware, usuarioRoutes);










