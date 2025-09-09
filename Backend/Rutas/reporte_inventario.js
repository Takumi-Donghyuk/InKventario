const express = require('express');
const router = express.Router();
const { sql } = require('../Configuration/db');

// Reporte de inventario
router.get("/", async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT p.id, p.nombre, p.stock, c.nombre AS categoria, m.nombre AS marca
      FROM Productos p
      JOIN Categorias c ON p.categoria_id = c.id
      JOIN Marcas m ON p.marca_id = m.id
    `);

    // result.recordset es donde vienen las filas en mssql
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error en reporte de inventario:", err);
    res.status(500).send("Error al generar reporte de inventario");
  }
});

module.exports = router;