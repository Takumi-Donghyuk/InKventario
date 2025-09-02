const express = require("express");
const router = express.Router();
const { sql } = require('../Configuration/db');
const bcrypt = require("bcryptjs");

// Ruta general de login
router.get("/", (req, res) => {
    if (req.session && req.session.user) {
        switch(req.session.user.rol) {
            case "administrador":
                return res.redirect("/admin");
            case "empleado":
                return res.redirect("/empleado");
            default:
                req.session.destroy(); 
                return res.redirect("/login");
        }
    }
    res.render("login"); 
});

// Ruta de procesamiento del login
router.post("/", async (req, res) => {
  // Recoge los datos del formulario
  const { correo, contrasena } = req.body;
  try {
    // Consulta usuario en BD
    const result = await sql.query`SELECT * FROM Usuario WHERE correo=${correo}`;
    const user = result.recordset[0];
    // Valida si existe el usuario
    if (!user) return res.status(401).render("login", { error: "Usuario no encontrado" });
    // Compara la contraseña ingresada con la contraseña encriptada almacenada
    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) return res.status(401).render("login", { error: "Contraseña incorrecta" });
    // Guarda los datos en sesión
    req.session.user = {
      id: user.id_usuario,
      correo: user.correo,
      nombre: user.nombre, 
      telefono: user.telefono, 
      cedula: user.cedula,
      rol: user.rol
    };
    // Redirige según el rol
    switch(user.rol) {
            case "administrador":
                return res.redirect("/admin");
            case "empleado":
                return res.redirect("/empleado");
            default:
                req.session.destroy();
                return res.status(403).render("login", { error: "Rol no autorizado" });
    }
  } catch (err) {
    // Manejo de errores del servidor
    console.error(err);
    return res.status(500).render("login", { error: "Error del servidor" });
  }
});

// Ruta de cierre de sesión
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error destruyendo sesión:", err);
      return res.status(500).send("Error al cerrar sesión");
    }
    res.clearCookie("connect.sid"); 
    res.redirect("/login");
  });
});
module.exports = router;






