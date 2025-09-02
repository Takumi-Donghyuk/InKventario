const express = require('express');
const router = express.Router();
const { sql } = require('../Configuration/db');


// Ruta para mostrar formulario para crear marca
router.get("/crear", (req, res) => {
  res.render("crear_marca", { user: req.session.user });
});


// Ruta para crear una nueva marca
router.post('/crear', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        // Validar campos obligatorios
        if (!nombre) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        const usuarioId = req.session.user.id;
        // Insertar en la base de datos
        await sql.query`
        INSERT INTO Marca (nombre, usuarioId, descripcion)
        VALUES (${nombre}, ${usuarioId}, ${descripcion})
        `;
        res.redirect("/marcas");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear la marca');
    }
});

// Ruta para consultar las marcas
router.get("/", async (req, res) => {
  try {
    const result = await sql.query`SELECT nombre, descripcion FROM Marca`;
    const marcas = result.recordset;
    res.render("consultar_marcas", { marcas, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error servidor");
  }
});

// Ruta para listar las marcas y editarlas
router.get("/editar", async (req, res) => {
  try {
    const result = await sql.query`SELECT id_marca, nombre, descripcion FROM Marca`;
    const marcas = result.recordset;
    res.render("editar_marca", { marcas, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para mostrar el formulario y editar la marca
router.get("/editar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM Marca WHERE id_marca = ${id}`;
    const marca = result.recordset[0];

    if (!marca) {
      return res.status(404).send("Marca no encontrada");
    }

    res.render("editar_marca_id", { marca, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para actualizar una marca por id
router.post('/editar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        // Construir query dinámico para actualizar solo los campos que vienen
        const updates = {};
        if (nombre) updates.nombre = nombre;
        if (descripcion) updates.descripcion = descripcion;

        if (Object.keys(updates).length === 0) {
            return res.status(400).send("No se enviaron campos para actualizar");
        }
   
        const setClauses = Object.keys(updates).map(
            (campo) => `${campo} = @${campo}`
        ).join(", ");

        const request = new sql.Request();
        request.input("id", sql.Int, id);


        // Agregar dinámicamente cada campo como parámetro
        for (const campo in updates) {
            request.input(campo, updates[campo]);
        }

        await request.query(`UPDATE Marca SET ${setClauses} WHERE id_marca = @id`);

        res.send(`
        <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Marca actualizada</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  </head>
  <body>
    <script>
      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'Marca actualizada correctamente',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        window.location.href = '/admin';
      });
    </script>
  </body>
  </html>
        `);
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar la marca');
    }
});

// Ruta GET: listar marcas para eliminar
router.get("/eliminar", async (req, res) => {
  try {
    const result = await sql.query`SELECT id_marca, nombre, descripcion FROM Marca`;
    const marcas = result.recordset;
    res.render("eliminar_marca", { marcas, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para eliminar una categoría por id
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql.query`DELETE FROM Marca WHERE id_marca = ${id}`;
    console.log('Resultado de la eliminación:', result);

    if(result.rowsAffected[0] === 0){
      return res.status(404).send('Marca no encontrada');
    }

    res.send('Marca eliminada correctamente');
  } catch (err) {
    console.error('Error en DELETE /eliminar/:id:', err);
    res.status(500).send('Error al eliminar la marca');
  }
});

module.exports = router;