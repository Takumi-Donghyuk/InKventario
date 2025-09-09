const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();
const { sql } = require('../Configuration/db');

// Ruta para mostrar el formulario que crea la carta
router.get("/", async (req, res) => {
  try {
  const proveedoresResult = await sql.query`SELECT id_proveedor, nombre FROM Proveedor`;
  const proveedores = proveedoresResult.recordset;
  console.log(proveedores);
  res.render("crear_carta", {proveedores, user: req.session.user });
  } catch (error) {
    console.error(err);
    res.status(500).send("Error al cargar el formulario para la carta al proveedor");
  }
});



router.post('/generar_carta', (req, res) => {
  const { proveedor, remitente, fecha, ciudad, producto } = req.body;
  res.setHeader('Content-disposition', 'attachment; filename=carta.pdf');
  res.setHeader('Content-type', 'application/pdf');

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(16).text('Carta de solicitud de reabastecimiento', { align: 'center' });
  doc.moveDown();
  doc.moveDown();
  doc.fontSize(11).text('Papelería El Bunker')
  doc.fontSize(11).text(`${ciudad}, ${fecha}`);
  doc.moveDown();
  doc.fontSize(11).text(`Estimado(a) ${proveedor},`);
  doc.moveDown();

doc.text(`Me complace dirigirme a usted a través de la presente, con el fin de solicitarle con la mayor cordialidad que yo pueda ejercer, el oportuno y necesario reabastecimiento de los siguientes productos:

"${producto}".

Confío plenamente en que, como siempre, su atención y diligencia serán invaluables para atender esta solicitud con la prontitud y eficiencia que caracteriza a su distinguida organización.
Sin otro particular, y reiterando mi más efusivo saludo, me despido con la esperanza de su pronta respuesta.`
);
  doc.moveDown();
  doc.moveDown();
  doc.text('Atentamente,');
  doc.text(remitente);
  doc.end();
});

module.exports = router;