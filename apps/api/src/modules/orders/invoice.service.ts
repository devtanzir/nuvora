// invoice.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface InvoiceOrderData {
  orderNumber: string | null;
  stripePaymentId: string | null;
  createdAt: Date;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: {
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
  address: {
    fullName: string;
    street: string;
    city: string;
    district: string;
    postalCode: string;
    phone: string;
  } | null;
  items: {
    price: number; // cents
    quantity: number;
    product: { name: string };
    variant: { name: string; value: string } | null;
  }[];
}

@Injectable()
export class InvoiceService {
  async generateInvoice(order: InvoiceOrderData): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    // ── Header ──
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('NUVORA', { align: 'center' })
      .fontSize(10)
      .font('Helvetica')
      .text('Premium E-Commerce', { align: 'center' })
      .moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    doc
      .moveDown(0.5)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('INVOICE', { align: 'center' })
      .moveDown(0.5);

    // Order info
    let currentY = doc.y;
    const leftX = 50;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Order Number:', leftX, currentY, { continued: true })
      .font('Helvetica')
      .text(` ${order.orderNumber}`)
      .moveDown(0.2);

    currentY = doc.y;
    doc
      .font('Helvetica-Bold')
      .text('Date:', leftX, currentY, { continued: true })
      .font('Helvetica')
      .text(` ${order.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
      .moveDown(0.2);

    currentY = doc.y;
    doc
      .font('Helvetica-Bold')
      .text('Payment ID:', leftX, currentY, { continued: true })
      .font('Helvetica')
      .text(` ${order.stripePaymentId}`)
      .moveDown(0.5);

    // Shipping Address
    if (order.address) {
      doc
        .font('Helvetica-Bold')
        .text('Shipping Address:', leftX)
        .font('Helvetica')
        .text(`${order.address.fullName}`)
        .text(`${order.address.street}`)
        .text(`${order.address.city}, ${order.address.district} ${order.address.postalCode}`)
        .text(`Phone: ${order.address.phone}`)
        .moveDown(0.8);
    }

    // ── Items Table ──
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = [30, 170, 80, 80, 80];
    const headers = ['#', 'Item', 'Qty', 'Unit Price', 'Total'];

    doc.font('Helvetica-Bold').fontSize(10);
    let xPos = tableLeft;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: i === 0 ? 'center' : 'left' });
      xPos += colWidths[i];
    });

    doc.moveTo(tableLeft, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    let rowY = tableTop + 20;
    doc.font('Helvetica').fontSize(9);
    order.items.forEach((item, index) => {
      const price = item.price / 100; // cents → dollars
      const itemTotal = price * item.quantity;

      xPos = tableLeft;
      doc.text((index + 1).toString(), xPos, rowY, { width: colWidths[0], align: 'center' });
      xPos += colWidths[0];

      const itemLabel = `${item.product.name}${item.variant ? ` (${item.variant.name}: ${item.variant.value})` : ''}`;
      doc.text(itemLabel, xPos, rowY, { width: colWidths[1] });
      xPos += colWidths[1];

      doc.text(item.quantity.toString(), xPos, rowY, { width: colWidths[2], align: 'center' });
      xPos += colWidths[2];

      doc.text(`$${price.toFixed(2)}`, xPos, rowY, { width: colWidths[3], align: 'right' });
      xPos += colWidths[3];

      doc.text(`$${itemTotal.toFixed(2)}`, xPos, rowY, { width: colWidths[4], align: 'right' });

      rowY += 18;
      if (rowY > 700) {
        doc.addPage();
        rowY = 50;
      }
    });

    // ── Totals ──
    rowY += 10;
    doc.moveTo(400, rowY).lineTo(545, rowY).stroke();
    rowY += 5;

    const subtotal = order.subtotal / 100;
    const discount = order.discount / 100;
    const total = order.total / 100;

    doc.fontSize(10).font('Helvetica');
    doc.text('Subtotal:', 400, rowY, { width: 80, align: 'right' });
    doc.text(`$${subtotal.toFixed(2)}`, 480, rowY, { width: 65, align: 'right' });
    rowY += 18;

    if (discount > 0) {
      doc.text('Discount:', 400, rowY, { width: 80, align: 'right' });
      doc.text(`-$${discount.toFixed(2)}`, 480, rowY, { width: 65, align: 'right' });
      rowY += 18;
    }

    if (order.promoCode) {
      const promoDesc = order.promoCode.discountType === 'PERCENTAGE'
        ? `${order.promoCode.discountValue}%`
        : `$${(order.promoCode.discountValue / 100).toFixed(2)}`;
      doc.fontSize(9).text(`Promo: ${order.promoCode.code} (${promoDesc})`, 400, rowY, { width: 145, align: 'right' });
      rowY += 15;
    }

    rowY += 2;
    doc.moveTo(400, rowY).lineTo(545, rowY).stroke();
    rowY += 5;

    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Total:', 400, rowY, { width: 80, align: 'right' });
    doc.text(`$${total.toFixed(2)}`, 480, rowY, { width: 65, align: 'right' });

    // Footer
    doc
      .moveDown(3)
      .fontSize(9)
      .font('Helvetica')
      .text('Thank you for shopping with Nuvora!', { align: 'center' })
      .text('If you have any questions, contact support@nuvora.com', { align: 'center' });

    doc.end();
    return pdfPromise;
  }
}
