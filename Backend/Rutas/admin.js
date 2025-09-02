const express = require("express");
const router = express.Router();

// Middleware para proteger rutas y verificar rol de admin
function adminMiddleware(req, res, next) {
  if (req.session.user && req.session.user.rol === "administrador") {
    return next();
  }
  return res.redirect("/login");
}

// Menú principal del admin
router.get("/", adminMiddleware, (req, res) => {
    console.log("Usuario en sesión:", req.session.user);
  res.render("menu_admin", { user: req.session.user });
});

module.exports = router;
