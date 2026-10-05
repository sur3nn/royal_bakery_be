import PDFDocument from 'pdfkit';

type KotType = 'kitchen' | 'packing';

const fmtDate = (d: any) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

const fmtTime = (t: any) =>
  t
    ? new Date(`1970-01-01T${t}`).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '-';

const num = (n: any) => Number(n).toString();

export class KotPdfService {
  static build(order: any, type: KotType) {
    const doc = new PDFDocument({
      size: 'A5',
      margin: 28,
    });

    const isKitchen = type === 'kitchen';

    const left = doc.page.margins.left;
    const width = doc.page.width - left * 2;

    // Title
    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(
        isKitchen ? 'KITCHEN KOT' : 'PACKING KOT',
        { align: 'center' }
      );

    doc
      .moveDown(0.3)
      .fontSize(10)
      .font('Helvetica')
      .text(
        `KOT No: ${
          isKitchen
            ? order.kitchen_kot_no
            : order.packing_kot_no
        }    Order: ${order.order_number}`,
        { align: 'center' }
      );

    doc.moveDown(0.6);

    // Header details
    doc.fontSize(10);

    doc.text(
      `Deliver on: ${fmtDate(order.delivery_date)} at ${fmtTime(
        order.delivery_time
      )}`
    );

    if (order.occasion) {
      doc.text(`Occasion: ${order.occasion}`);
    }

    if (!isKitchen) {
      doc.text(`Customer: ${order.customer_name || '-'}`);

      if (order.delivery_address) {
        doc.text(`Address: ${order.delivery_address}`);
      }
    }

    doc.moveDown(0.6);

    // Table columns
    const cols = isKitchen
      ? [
          {
            h: 'Item',
            w: width * 0.65,
          },
          {
            h: 'Make',
            w: width * 0.35,
          },
        ]
      : [
          {
            h: 'Item',
            w: width * 0.4,
          },
          {
            h: 'Box size',
            w: width * 0.22,
          },
          {
            h: 'Boxes',
            w: width * 0.16,
          },
          {
            h: 'Total',
            w: width * 0.22,
          },
        ];

    const row = (cells: string[], bold = false) => {
      const y = doc.y;

      doc
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(11);

      let x = left;
      let maxH = 0;

      cells.forEach((c, i) => {
        doc.text(c, x, y, {
          width: cols[i].w - 6,
        });

        maxH = Math.max(maxH, doc.y - y);

        x += cols[i].w;
      });

      doc.y = y + maxH + 6;

      doc
        .moveTo(left, doc.y - 3)
        .lineTo(left + width, doc.y - 3)
        .strokeColor('#cccccc')
        .stroke();
    };

    // Header
    row(
      cols.map((c) => c.h),
      true
    );

    // Products
    for (const it of order.products || []) {
      const total = `${num(it.quantity)} ${it.unit}`;

      row(
        isKitchen
          ? [
              it.productName,
              total,
            ]
          : [
              it.productName,
              `${num(it.packSize)} ${it.unit}`,
              `${it.packCount}`,
              total,
            ]
      );
    }

    // Special instructions
    if (order.special_instructions) {
      doc
        .moveDown(0.8)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(
          'Note:',
          left,
          doc.y,
          { continued: true }
        )
        .font('Helvetica')
        .text(
          ` ${order.special_instructions}`
        );
    }

    // IMPORTANT:
    // Do NOT call doc.end() here.
    return doc;
  }
}