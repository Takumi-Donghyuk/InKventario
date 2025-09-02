const express = require('express');
const router = express.Router();
const { sql } = require('../Configuration/db');


// Ruta para mostrar formulario para crear categoría
router.get("/crear", (req, res) => {
  res.render("crear_categoria", { user: req.session.user });
});


// Ruta para crear una nueva categoría
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
        INSERT INTO Categoria (nombre, usuarioId, descripcion)
        VALUES (${nombre}, ${usuarioId}, ${descripcion})
        `;
        res.redirect("/categorias");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear la categoría');
    }
});

// Ruta para consultar las categorías
router.get("/", async (req, res) => {
  try {
    const result = await sql.query`SELECT nombre, descripcion FROM Categoria`;
    const categorias = result.recordset;
    res.render("consultar_categorias", { categorias, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error servidor");
  }
});

// Ruta para listar las categorías y editarlas
router.get("/editar", async (req, res) => {
  try {
    const result = await sql.query`SELECT id_categoria, nombre, descripcion FROM Categoria`;
    const categorias = result.recordset;
    res.render("editar_categoria", { categorias, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para mostrar el formulario y editar la categoría
router.get("/editar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM Categoria WHERE id_categoria = ${id}`;
    const categoria = result.recordset[0];

    if (!categoria) {
      return res.status(404).send("Categoría no encontrada");
    }

    res.render("editar_categoria_id", { categoria, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para actualizar una categoría por id
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

        await request.query(`UPDATE Categoria SET ${setClauses} WHERE id_categoria = @id`);

        res.send(`
        <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Categoria actualizada</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  </head>
  <body>
    <script>
      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'Categoría actualizada correctamente',
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
        res.status(500).send('Error al actualizar la categoría');
    }
});

// Ruta GET: listar categorías para eliminar
router.get("/eliminar", async (req, res) => {
  try {
    const result = await sql.query`SELECT id_categoria, nombre, descripcion FROM Categoria`;
    const categorias = result.recordset;
    res.render("eliminar_categoria", { categorias, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para eliminar una categoría por id
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql.query`DELETE FROM Categoria WHERE id_categoria = ${id}`;
    console.log('Resultado de la eliminación:', result);

    if(result.rowsAffected[0] === 0){
      return res.status(404).send('Categoría no encontrada');
    }

    res.send('Categoría eliminada correctamente');
  } catch (err) {
    console.error('Error en DELETE /eliminar/:id:', err);
    res.status(500).send('Error al eliminar la categoría');
  }
});

module.exports = router;