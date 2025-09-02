const express = require('express');
const router = express.Router();
const { sql } = require('../Configuration/db');


// Ruta para mostrar formulario para crear proveedor
router.get("/crear", (req, res) => {
  res.render("crear_proveedor", { user: req.session.user });
});


// Ruta para crear un nuevo proveedor
router.post('/crear', async (req, res) => {
    try {
        const { nombre, telefono, correo, direccion } = req.body;
        // Validar campos obligatorios
        if (!nombre || !telefono || !correo || !direccion) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        const usuarioId = req.session.user.id;
        // Insertar en la base de datos
        await sql.query`
        INSERT INTO Proveedor (nombre, telefono, correo, direccion, usuarioId)
        VALUES (${nombre}, ${telefono}, ${correo}, ${direccion}, ${usuarioId})
        `;
        res.redirect("/proveedores");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear al proveedor');
    }
});

// Ruta para consultar los proveedores
router.get("/", async (req, res) => {
  try {
    const result = await sql.query`SELECT nombre, telefono, correo, direccion 
    FROM Proveedor`;
    const proveedores = result.recordset;
    res.render("consultar_proveedores", { proveedores, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error servidor");
  }
});

// Ruta para listar los proveedores y editarlos
router.get("/editar", async (req, res) => {
  try {
    const result = await sql.query`SELECT id_proveedor, nombre, telefono, correo, direccion FROM Proveedor`;
    const proveedores = result.recordset;
    res.render("editar_proveedor", { proveedores, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para mostrar el formulario y editar el proveedor
router.get("/editar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM Proveedor WHERE id_proveedor = ${id}`;
    const proveedor = result.recordset[0];
    if (!proveedor) {
      return res.status(404).send("Proveedor no encontrado");
    }

    res.render("editar_proveedor_id", { proveedor, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para actualizar un proveedor por id
router.post('/editar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, correo, direccion } = req.body;

        // Construir query dinámico para actualizar solo los campos que vienen
        const updates = {};
        if (nombre) updates.nombre = nombre;
        if (telefono) updates.telefono = telefono;
        if (correo) updates.correo = correo;
        if (direccion) updates.direccion = direccion;

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

        await request.query(`UPDATE Proveedor SET ${setClauses} WHERE id_proveedor = @id`);

        res.send(`
        <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Proveedor actualizado</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  </head>
  <body>
    <script>
      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'Proveedor actualizado correctamente',
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
        res.status(500).send('Error al actualizar el proveedor');
    }
});

// Ruta GET: listar proveedores para eliminar
router.get("/eliminar", async (req, res) => {
  try {
    const result = await sql.query`SELECT id_proveedor, nombre, telefono, correo, direccion FROM Proveedor`;
    const proveedores = result.recordset;
    res.render("eliminar_proveedor", { proveedores, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para eliminar una categoría por id
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql.query`DELETE FROM Proveedor WHERE id_proveedor = ${id}`;
    console.log('Resultado de la eliminación:', result);

    if(result.rowsAffected[0] === 0){
      return res.status(404).send('Proveedor no encontrado');
    }

    res.send('Proveedor eliminado correctamente');
  } catch (err) {
    console.error('Error en DELETE /eliminar/:id:', err);
    res.status(500).send('Error al eliminar al proveedor');
  }
});

module.exports = router;