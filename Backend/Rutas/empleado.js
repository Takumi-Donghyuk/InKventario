const express = require("express");
const router = express.Router();

// Middleware para proteger rutas y verificar rol de empleado
function empleadoMiddleware(req, res, next) {
  if (req.session.user && req.session.user.rol === "empleado") {
    return next();
  }
  return res.redirect("/login");
}

// Menú principal del empleado
router.get("/", empleadoMiddleware, (req, res) => {
  console.log("Empleado en sesión:", req.session.user);
  res.render("menu_empleado", { user: req.session.user });
});

module.exports = router;