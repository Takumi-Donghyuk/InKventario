const express = require('express');
const router = express.Router();
const { sql } = require('../Configuration/db');
const bcrypt = require('bcryptjs');

// Ruta para mostrar formulario para crear usuario
router.get("/crear", (req, res) => {
  res.render("crear_usuario", { user: req.session.user });
});

// Ruta para crear un nuevo usuario
router.post('/crear', async (req, res) => {
    try {
        // Estado por defecto activo
        const estado = true;
        const { nombre, cedula, correo, telefono, contrasena, rol } = req.body;
        // Validar campos obligatorios
        if (!nombre || !cedula || !correo || !telefono || !contrasena || !rol) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        // Insertar en la base de datos
        await sql.query`
        INSERT INTO Usuario (nombre, cedula, correo, telefono, contrasena, rol, estado, fecha_creacion)
        VALUES (${nombre}, ${cedula}, ${correo}, ${telefono}, ${hashedPassword}, ${rol}, ${estado}, GETDATE())
        `;
        res.redirect("/usuarios");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear el usuario');
    }
});

// Ruta para consultar los usuarios
router.get("/", async (req, res) => {
  try {
    const result = await sql.query`SELECT nombre, correo, telefono, 
    rol, fecha_creacion FROM Usuario`;
    const usuarios = result.recordset;
    res.render("consultar_usuarios", { usuarios, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error servidor");
  }
});

// Ruta para listar los usuarios y editarlos
router.get("/editar", async (req, res) => {
  try {
    const result = await sql.query`SELECT id_usuario, nombre, correo, telefono, rol, fecha_creacion FROM Usuario`;
    const usuarios = result.recordset;
    res.render("editar_usuario", { usuarios, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para mostrar el formulario y editar el usuario
router.get("/editar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM Usuario WHERE id_usuario = ${id}`;
    const usuario = result.recordset[0];

    if (!usuario) {
      return res.status(404).send("Usuario no encontrado");
    }

    res.render("editar_usuario_id", { usuario, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para actualizar un usuario por id
router.post('/editar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cedula, correo, telefono, contrasena, rol, estado } = req.body;

        // Hashear la contraseña
        let hashedPassword = undefined;
        if (contrasena) {
            hashedPassword = await bcrypt.hash(contrasena, 10);
        }

        // Construir query dinámico para actualizar solo los campos que vienen
        const updates = {};
        if (nombre) updates.nombre = nombre;
        if (cedula) updates.cedula = cedula;
        if (correo) updates.correo = correo;
        if (telefono) updates.telefono = telefono;
        if (rol) updates.rol = rol;
        if (estado !== undefined) updates.estado = estado ? 1 : 0;
        if (hashedPassword) updates.contrasena = hashedPassword;

        if (Object.keys(updates).length === 0) {
            return res.status(400).send("No se enviaron campos para actualizar");
        }
        // Construimos la query con parámetros
        const setClauses = Object.keys(updates).map(
            (campo) => `${campo} = @${campo}`
        ).join(", ");

        const request = new sql.Request();
        request.input("id", sql.Int, id);


        // Agregar dinámicamente cada campo como parámetro
        for (const campo in updates) {
            request.input(campo, updates[campo]);
        }

        await request.query(`UPDATE Usuario SET ${setClauses} WHERE id_usuario = @id`);

        res.send(`
        <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Usuario actualizado</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  </head>
  <body>
    <script>
      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'Usuario actualizado correctamente',
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
        res.status(500).send('Error al actualizar el usuario');
    }
});

// Ruta GET: listar usuarios para eliminar
router.get("/eliminar", async (req, res) => {
  try {
    const result = await sql.query`SELECT id_usuario, nombre, correo, telefono, rol, fecha_creacion FROM Usuario`;
    const usuarios = result.recordset;
    res.render("eliminar_usuario", { usuarios, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para eliminar un usuario por id
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('ID recibido para eliminar:', id); // <- esto nos muestra el id

    const result = await sql.query`DELETE FROM Usuario WHERE id_usuario = ${id}`;
    console.log('Resultado de la eliminación:', result);

    if(result.rowsAffected[0] === 0){
      return res.status(404).send('Usuario no encontrado');
    }

    res.send('Usuario eliminado correctamente');
  } catch (err) {
    console.error('Error en DELETE /eliminar/:id:', err);
    res.status(500).send('Error al eliminar el usuario');
  }
});


module.exports = router;