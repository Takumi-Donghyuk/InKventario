const express = require('express');
const router = express.Router();
const { sql } = require('../Configuration/db');


// Ruta para mostrar formulario para crear producto
router.get("/crear", async (req, res) => {
  try {
    const categoriasResult = await sql.query`SELECT id_categoria, nombre, descripcion FROM Categoria`;
    const marcasResult = await sql.query`SELECT id_marca, nombre, descripcion FROM Marca`;
    const proveedoresResult = await sql.query`SELECT id_proveedor, nombre, telefono, correo, direccion FROM Proveedor`;
    const categorias = categoriasResult.recordset;
    const marcas = marcasResult.recordset;
    const proveedores = proveedoresResult.recordset;

    res.render("crear_producto", { 
      categorias, 
      marcas, 
      proveedores, 
      user: req.session.user 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al cargar el formulario de productos");
  }
});

// Ruta para crear un nuevo producto
router.post('/crear', async (req, res) => {
    try {
        const { nombre, precio, cantidad, categoriaId, marcaId, proveedorId, url_imagen } = req.body;
        // Validar campos obligatorios
        if (!nombre || !precio || !cantidad || !categoriaId || !marcaId || !proveedorId || !url_imagen) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        const usuarioId = req.session.user.id;

        // Insertar en la base de datos
        await sql.query`
            INSERT INTO Producto 
                (nombre, precio, cantidad, categoriaId, marcaId, proveedorId, usuarioId, url_imagen)
            VALUES 
                (${nombre}, ${precio}, ${cantidad}, ${categoriaId}, ${marcaId}, ${proveedorId}, ${usuarioId}, ${url_imagen})
        `;

        res.redirect("/empleado");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear al proveedor');
    }
});

// Ruta para consultar los productos
router.get("/", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.cantidad,
        p.url_imagen,
        c.nombre AS categoriaNombre,
        m.nombre AS marcaNombre,
        pr.nombre AS proveedorNombre
      FROM Producto p
      LEFT JOIN Categoria c ON p.categoriaId = c.id_categoria
      LEFT JOIN Marca m ON p.marcaId = m.id_marca
      LEFT JOIN Proveedor pr ON p.proveedorId = pr.id_proveedor
    `;

    const productos = result.recordset;
    res.render("consultar_productos", { productos, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error servidor");
  }
});



// Ruta para listar los productos y editarlos
router.get("/editar", async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.cantidad,
        p.url_imagen,
        c.nombre AS categoriaNombre,
        m.nombre AS marcaNombre,
        pr.nombre AS proveedorNombre
      FROM Producto p
      INNER JOIN Categoria c ON p.categoriaId = c.id_categoria
      INNER JOIN Marca m ON p.marcaId = m.id_marca
      INNER JOIN Proveedor pr ON p.proveedorId = pr.id_proveedor
    `);

    const productos = result.recordset;
    res.render("editar_producto", { productos, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los productos");
  }
});


// Ruta para mostrar el formulario y editar el producto
router.get("/editar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM Producto WHERE id_producto = ${id}`;
    const producto = result.recordset[0];
    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }
    const categoriasResult = await sql.query`SELECT id_categoria, nombre, descripcion FROM Categoria`;
    const marcasResult = await sql.query`SELECT id_marca, nombre, descripcion FROM Marca`;
    const proveedoresResult = await sql.query`SELECT id_proveedor, nombre, telefono, correo, direccion FROM Proveedor`;
    const categorias = categoriasResult.recordset;
    const marcas = marcasResult.recordset;
    const proveedores = proveedoresResult.recordset;

    res.render("editar_producto_id", { 
      categorias, 
      marcas, 
      proveedores, 
      producto,
      user: req.session.user 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para actualizar un producto por id
router.post('/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, cantidad, categoriaId, marcaId, proveedorId, url_imagen } = req.body;

    // Construir query dinámico para actualizar solo los campos enviados
    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (precio) updates.precio = precio;
    if (cantidad) updates.cantidad = cantidad;
    if (categoriaId) updates.categoriaId = categoriaId;
    if (marcaId) updates.marcaId = marcaId;
    if (proveedorId) updates.proveedorId = proveedorId;
    if (url_imagen) updates.url_imagen = url_imagen;

    if (Object.keys(updates).length === 0) {
      return res.status(400).send("No se enviaron campos para actualizar");
    }

    // Construcción de la parte SET
    const setClauses = Object.keys(updates)
      .map(campo => `${campo} = @${campo}`)
      .join(", ");

    const request = new sql.Request();
    request.input("id", sql.Int, id);

    // Pasar dinámicamente los parámetros
    for (const campo in updates) {
      request.input(campo, updates[campo]);
    }

    // Ejecutar actualización
    await request.query(`UPDATE Producto SET ${setClauses} WHERE id_producto = @id`);

    // Respuesta con alerta bonita
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Producto actualizado</title>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
      </head>
      <body>
        <script>
          Swal.fire({
            icon: 'success',
            title: '¡Listo!',
            text: 'Producto actualizado correctamente',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            window.location.href = '/empleado';
          });
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar el producto");
  }
});


// Ruta GET: listar productos para eliminar
router.get("/eliminar", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT id_producto, nombre, precio, cantidad, categoriaId, marcaId, proveedorId, url_imagen 
      FROM Producto`;
    const productos = result.recordset;

    res.render("eliminar_producto", { productos, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});


// Ruta para eliminar un producto por id
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await sql.query`DELETE FROM Producto WHERE id_producto = ${id}`;

    res.status(200).send("Producto eliminado correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar el producto");
  }
});

module.exports = router;