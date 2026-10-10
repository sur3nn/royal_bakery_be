import PDFDocument from 'pdfkit';

export interface KitchenSummaryRow {
  productId: number;
  productName: string; // Comes from the database
  unit: string;
  totalQuantity: number;
  orderCount: number;
}

const showDate = (iso: string) => iso.split('-').reverse().join('/');

const nowText = () => {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, '0');

  return `${p(n.getDate())}/${p(n.getMonth() + 1)}/${n.getFullYear()} ${p(n.getHours())}:${p(n.getMinutes())}`;
};

// 0.5 kg -> "500 g", 3 kg -> "3 kg"
const formatQty = (qty: number, unit: string) => {
  const u = (unit || '').trim().toLowerCase();
  const n = +qty.toFixed(3);

  if (['kg', 'kgs', 'kilogram', 'kilograms'].includes(u)) {
    return n < 1 ? `${Math.round(n * 1000)} g` : `${n} kg`;
  }

  if (['g', 'gm', 'gms', 'gram', 'grams'].includes(u)) {
    return `${n} g`;
  }

  return `${n} ${unit || ''}`.trim();
};

export class KitchenSummaryPdfService {
  /**
   * Returns a PDFKit document.
   * Controller usage:
   * const pdf = KitchenSummaryPdfService.build(rows, from, to, orderCount);
   * pdf.pipe(res);
   * pdf.end();
   */
  static build(
    rows: KitchenSummaryRow[],
    from: string,
    to: string,
    orderCount: number
  ) {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    const left = doc.page.margins.left;
    const width =
      doc.page.width -
      doc.page.margins.left -
      doc.page.margins.right;

    // Column layout
    const colNo = { x: left, w: 45 };
    const colName = { x: left + 45, w: width - 45 - 140 - 90 };
    const colQty = { x: left + width - 140 - 90, w: 140 };
    const colOrders = { x: left + width - 90, w: 90 };

    // ----- Title -----
    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#29252A')
      .text('Kitchen KOT', left, 40, {
        width,
        align: 'center',
      });

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#756B70')
      .text('Total Preparation Summary', left, 68, {
        width,
        align: 'center',
      });

    const dateText =
      from === to
        ? showDate(from)
        : `${showDate(from)} - ${showDate(to)}`;

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('#29252A')
      .text(`Date: ${dateText}`, left, 98, {
        width: width / 2,
      });

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('#29252A')
      .text(`Total Orders: ${orderCount}`, left + width / 2, 98, {
        width: width / 2,
        align: 'right',
      });

    let y = 130;

    // ----- Table Header -----
    const drawHeader = () => {
      doc.rect(left, y, width, 28).fill('#C94F6D');

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#FFFFFF');

      doc.text('S.No.', colNo.x + 8, y + 7, {
        width: colNo.w - 8,
        lineBreak: false,
      });

      doc.text('Product', colName.x + 8, y + 7, {
        width: colName.w - 8,
        lineBreak: false,
      });

      doc.text('Total Quantity', colQty.x, y + 7, {
        width: colQty.w - 8,
        align: 'right',
        lineBreak: false,
      });

      doc.text('Orders', colOrders.x, y + 7, {
        width: colOrders.w - 8,
        align: 'right',
        lineBreak: false,
      });

      y += 28;
    };

    drawHeader();

    const rowH = 30;

    // ----- Table Rows -----
    rows.forEach((r, i) => {
      // Add a new page when the next row will not fit.
      if (
        y + rowH >
        doc.page.height - doc.page.margins.bottom - 30
      ) {
        doc.addPage();
        y = doc.page.margins.top;
        drawHeader();
      }

      // Alternate row background
      if (i % 2 === 0) {
        doc.rect(left, y, width, rowH).fill('#FFF9F5');
      }

      // Serial number
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#29252A')
        .text(String(i + 1), colNo.x + 8, y + 8, {
          width: colNo.w - 8,
          lineBreak: false,
        });

      // Product name
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#29252A')
        .text(r.productName, colName.x + 8, y + 7, {
          width: colName.w - 8,
          lineBreak: false,
          ellipsis: true,
        });

      // Total quantity
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#C94F6D')
        .text(formatQty(r.totalQuantity, r.unit), colQty.x, y + 7, {
          width: colQty.w - 8,
          align: 'right',
          lineBreak: false,
        });

      // Number of orders containing this product
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#756B70')
        .text(String(r.orderCount), colOrders.x, y + 8, {
          width: colOrders.w - 8,
          align: 'right',
          lineBreak: false,
        });

      // Row separator
      doc
        .moveTo(left, y + rowH)
        .lineTo(left + width, y + rowH)
        .lineWidth(0.5)
        .strokeColor('#EDE2E5')
        .stroke();

      y += rowH;
    });

    // ----- Footer -----
    const footerY = Math.min(
      y + 14,
      doc.page.height - doc.page.margins.bottom - 12
    );

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#756B70')
      .text(`Printed At: ${nowText()}`, left, footerY, {
        width,
        align: 'right',
        lineBreak: false,
      });

    return doc;
  }
}