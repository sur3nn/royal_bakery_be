import { Request, Response } from 'express';
import { SaleService } from '../services/sale.service';
  import { BillPdfService } from '../services/billpdf.service';
export class SaleController {
  static async createBill(req: Request, res: Response) {
    try {
      const result = await SaleService.createPOSBill(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const data = await SaleService.getAll();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }




  static async downloadBill(req: Request, res: Response) {
    try {
      const fmtDate : any= (d: any) => (d instanceof Date ? d.toLocaleDateString('en-IN') : String(d ?? '').slice(0, 10));
      const s: any = await SaleService.getOneWithItems(Number(req.params.id));
      if (!s) return res.status(404).json({ success: false, message: 'Invoice not found' });

      const subtotal = Number(s.subtotal);
      const discount = Number(s.discount || 0);
      const discountAmt = s.discount_type === 'percent' ? (subtotal * discount) / 100 : discount;

      const totals: [string, number][] = [['Subtotal', subtotal]];
      if (discountAmt > 0) totals.push([s.discount_type === 'percent' ? `Discount (${discount}%)` : 'Discount', -discountAmt]);
      totals.push(['CGST', Number(s.cgst)], ['SGST', Number(s.sgst)]);

      const pdf = BillPdfService.build({
        shopName: 'Kanagaraj Catering And Sweets',
        title: 'INVOICE',
        meta: [
          ['Invoice', s.invoice_number],
          ['Date', fmtDate(s.sale_date)],
          ['Time', String(s.sale_time ?? '')],
          ['Payment', s.payment_method],
        ],
        customer: [
          ['Customer', s.customer_name || 'Counter Customer'],
          ['Phone', s.customer_phone || '-'],
        ],
        lines: s.items.map((i: any) => ({
          name: i.product_name_snapshot,
          qty: `${Number(i.quantity)} ${i.unit}`,
          rate: Number(i.price_per_unit),
          amount: Number(i.total),
        })),
        totals,
        grandTotalLabel: 'Grand Total',
        grandTotal: Number(s.grand_total),
        footer: [
          ['Paid', Number(s.amount_paid)],
          ['Change', Number(s.balance_return)],
        ],
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${s.invoice_number}.pdf"`);
      pdf.pipe(res);
      pdf.end();
    } catch (err: any) {
      console.error('SALE BILL PDF ERROR:', err);
      if (!res.headersSent) return res.status(500).json({ success: false, message: err.message });
      res.end();
    }
  }
}
