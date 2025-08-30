// Archivo principal del servidor
const express=require('express');
const app=express();
const PORT=3000;
const cors = require("cors");
const { connectDB } = require('./Configuration/db.js');
// Middlewares
app.use(express.json());
app.use(cors())
// El servidor está escuchando
app.listen(PORT, ()=>{
    console.log("Sevidor encendido");
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
// Probar conexión a base de datos
connectDB(); 
//Ruta1
app.get('/', (req, res) => {
    res.send('Hola mundo');
});