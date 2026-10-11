import PDFDocument from 'pdfkit';

export interface BillLine { name: string; qty: string; rate: number; amount: number }

export interface BillData {
  shopName: string;
  title: string;
  meta: [string, string][];        // left block (invoice no, date...)
  customer: [string, string][];    // right block (name, phone...)
  lines: BillLine[];
  totals: [string, number][];      // subtotal, discount, gst...
  grandTotalLabel: string;
  grandTotal: number;
  footer: [string, number][];      // paid, balance...
}

const money = (n: number) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export class BillPdfService {
  static build(d: BillData) {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const L = 40, R = 555;

    // Header
    doc.font('Helvetica-Bold').fontSize(18).text(d.shopName, L, 40, { align: 'center', width: R - L });
    doc.font('Helvetica').fontSize(11).text(d.title, { align: 'center', width: R - L });
    doc.moveDown(0.5);
    doc.moveTo(L, doc.y).lineTo(R, doc.y).stroke();

    // Meta (left) + customer (right)
    const top = doc.y + 10;
    doc.fontSize(10);
    d.meta.forEach(([k, v], i) => {
      doc.font('Helvetica-Bold').text(`${k}: `, L, top + i * 15, { continued: true })
         .font('Helvetica').text(v);
    });
    d.customer.forEach(([k, v], i) => {
      doc.font('Helvetica-Bold').text(`${k}: `, 310, top + i * 15, { continued: true, width: R - 310 })
         .font('Helvetica').text(v);
    });
    let y = top + Math.max(d.meta.length, d.customer.length) * 15 + 12;

    // Table header
    const col = { item: [L + 4, 226], qty: [270, 90], rate: [360, 80], amt: [440, 115] };
    const drawHead = () => {
      doc.rect(L, y, R - L, 20).fill('#F3E9EC');
      doc.fillColor('#29252A').font('Helvetica-Bold').fontSize(9);
      doc.text('ITEM', col.item[0], y + 6, { width: col.item[1] });
      doc.text('QTY', col.qty[0], y + 6, { width: col.qty[1], align: 'right' });
      doc.text('RATE', col.rate[0], y + 6, { width: col.rate[1], align: 'right' });
      doc.text('AMOUNT', col.amt[0], y + 6, { width: col.amt[1] - 4, align: 'right' });
      y += 24;
    };
    drawHead();

    doc.font('Helvetica').fontSize(10);
    for (const l of d.lines) {
      const h = Math.max(18, doc.heightOfString(l.name, { width: col.item[1] }) + 6);
      if (y + h > 740) { doc.addPage(); y = 40; drawHead(); doc.font('Helvetica').fontSize(10); }
      doc.text(l.name, col.item[0], y, { width: col.item[1] });
      doc.text(l.qty, col.qty[0], y, { width: col.qty[1], align: 'right' });
      doc.text(money(l.rate), col.rate[0], y, { width: col.rate[1], align: 'right' });
      doc.text(money(l.amount), col.amt[0], y, { width: col.amt[1] - 4, align: 'right' });
      y += h;
      doc.moveTo(L, y - 2).lineTo(R, y - 2).strokeColor('#EDE2E5').stroke().strokeColor('#000');
    }

    // Totals
    if (y > 650) { doc.addPage(); y = 40; }
    y += 8;
    const row = (label: string, val: number, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 12 : 10);
      doc.text(label, 330, y, { width: 110, align: 'right' });
      doc.text(money(val), 440, y, { width: 115, align: 'right' });
      y += bold ? 20 : 16;
    };
    d.totals.forEach(([k, v]) => row(k, v));
    doc.moveTo(330, y).lineTo(R, y).stroke(); y += 6;
    row(d.grandTotalLabel, d.grandTotal, true);
    d.footer.forEach(([k, v]) => row(k, v));

    doc.font('Helvetica').fontSize(9).fillColor('#756B70')
       .text('Thank you! Visit again.', L, y + 20, { align: 'center', width: R - L });
    return doc;
  }
}