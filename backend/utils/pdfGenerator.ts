import PDFDocument from 'pdfkit';
import { Invoice, Order, Employee } from '../db';

/**
 * Generates a thermal-style receipt PDF for a given Invoice / Order.
 * Uses a typical continuous roll width of 280 points.
 */
export const generateInvoicePDF = (invoice: Invoice, order: Order): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [280, 550], // 80mm thermal style
        margin: 15,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header Logo Placeholder
      doc.font('Helvetica-Bold').fontSize(16).text('THE GREEN BISTRO', { align: 'center' });
      doc.font('Helvetica').fontSize(9).text('123 Gourmet Boulevard, Food Street', { align: 'center' });
      doc.font('Helvetica-Oblique').fontSize(8).text('Phone: +92 (300) 123-4567', { align: 'center' });
      
      doc.moveDown(1);
      
      // Invoice Details
      doc.font('Helvetica-Bold').fontSize(9).text(`INVOICE: ${invoice.invoiceNumber}`);
      doc.font('Helvetica').fontSize(8).text(`Date: ${new Date(invoice.generatedAt).toLocaleString()}`);
      doc.font('Helvetica').fontSize(8).text(`Type: ${order.orderType === 'dine-in' ? 'Dine-In' : 'Delivery'}`);
      if (order.orderType === 'dine-in' && order.tableNumber) {
        doc.font('Helvetica-Bold').fontSize(8).text(`Table: ${order.tableNumber}`);
      } else if (order.orderType === 'delivery') {
        doc.font('Helvetica').fontSize(8).text(`Cust: ${order.customerName || 'N/A'}`);
        if (order.customerAddress) {
          doc.font('Helvetica').fontSize(8).text(`Addr: ${order.customerAddress.substring(0, 35)}`);
        }
      }
      
      // Divider
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(8).text('---------------------------------------------------------', { align: 'center' });
      
      // Table Header
      doc.font('Helvetica-Bold').fontSize(8);
      doc.text('Item', 15, doc.y, { width: 140, continued: true });
      doc.text('Qty', 155, doc.y, { width: 30, continued: true });
      doc.text('Price', 185, doc.y, { width: 40, continued: true });
      doc.text('Total', 225, doc.y, { width: 40 });
      
      doc.font('Helvetica').fontSize(8).text('---------------------------------------------------------', { align: 'center' });
      
      // Items list
      invoice.items.forEach((item) => {
        doc.font('Helvetica').fontSize(8);
        
        // Let the name wrap nicely if it's too long
        const yStart = doc.y;
        doc.text(item.productName, 15, yStart, { width: 135 });
        const yEndName = doc.y;
        
        // Place other columns alongside it
        doc.text(String(item.quantity), 155, yStart, { width: 30 });
        doc.text(String(item.unitPrice), 185, yStart, { width: 40 });
        doc.font('Helvetica-Bold').text(String(item.subtotal), 225, yStart, { width: 40 });
        
        // Ensure next element starts below the wrapped item name
        doc.y = Math.max(yEndName, yStart + 10);
      });
      
      // Divider
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(8).text('---------------------------------------------------------', { align: 'center' });
      
      // Total
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text(`TOTAL: Rs. ${invoice.totalAmount}`, { align: 'right' });
      
      // Footer Note
      doc.moveDown(1.5);
      doc.font('Helvetica').fontSize(8).text('Thank you for dining with us!', { align: 'center' });
      doc.font('Helvetica-Oblique').fontSize(8).text('Soft-powered by Green Bistro Engine', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generates a full letter-page Financial Monthly Report.
 */
export const generateMonthlyReportPDF = (
  monthYear: string,
  stats: {
    totalSales: number;
    totalOrders: number;
    totalWages: number;
    netProfit: number;
  },
  productsByCategory: Record<string, number>,
  salariesPaid: { employeeName: string; category: string; salaryPaid: number }[]
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#166534').text('THE GREEN BISTRO', { align: 'center' });
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#374151').text(`Monthly Financial Performance Report: ${monthYear}`, { align: 'center' });
      doc.fillColor('#9CA3AF').text('________________________________________________________________________________', { align: 'center' });
      
      doc.moveDown(1.5);

      // Financial KPI Grid Section
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F2937').text('Executive Financial Summary');
      doc.moveDown(0.4);

      // We'll draw simple summary boxes
      const boxWidth = 120;
      const boxHeight = 50;
      const startX = 40;
      const startY = doc.y;

      // Sales Box
      doc.rect(startX, startY, boxWidth, boxHeight).strokeColor('#E5E7EB').lineWidth(1).stroke();
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('TOTAL REVENUE', startX + 10, startY + 10);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534').text(`Rs. ${stats.totalSales}`, startX + 10, startY + 28);

      // Salary/Wages Box
      doc.rect(startX + 130, startY, boxWidth, boxHeight).strokeColor('#E5E7EB').stroke();
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('TOTAL WAGES', startX + 140, startY + 10);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#B91C1C').text(`Rs. ${stats.totalWages}`, startX + 140, startY + 28);

      // Orders Box
      doc.rect(startX + 260, startY, boxWidth, boxHeight).strokeColor('#E5E7EB').stroke();
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('TOTAL ORDERS', startX + 270, startY + 10);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F2937').text(`${stats.totalOrders}`, startX + 270, startY + 28);

      // Net Profit Box
      doc.rect(startX + 390, startY, boxWidth, boxHeight).strokeColor('#166534').lineWidth(2).stroke();
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('NET PROFIT', startX + 400, startY + 10);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534').text(`Rs. ${stats.netProfit}`, startX + 400, startY + 28);

      doc.y = startY + boxHeight + 20;

      // 2. Product Category Breakdown Table
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F2937').text('Product Category Sales Breakdown');
      doc.moveDown(0.4);

      // Table Header
      let currentY = doc.y;
      doc.rect(40, currentY, 532, 20).fill('#F3F4F6');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#374151');
      doc.text('Food Category', 50, currentY + 6);
      doc.text('Units Sold', 300, currentY + 6, { align: 'right', width: 260 });

      currentY += 20;
      doc.font('Helvetica').fontSize(9).fillColor('#4B5563');

      const categories = Object.keys(productsByCategory);
      if (categories.length === 0) {
        doc.rect(40, currentY, 532, 20).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        doc.text('No items sold to record.', 50, currentY + 6);
        currentY += 20;
      } else {
        categories.forEach((cat) => {
          doc.rect(40, currentY, 532, 20).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          doc.text(cat, 50, currentY + 6);
          doc.text(String(productsByCategory[cat]), 300, currentY + 6, { align: 'right', width: 260 });
          currentY += 20;
        });
      }

      doc.y = currentY + 20;

      // 3. Salaries & Wages Paid Table
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F2937').text('Staff Payroll & Salary Ledgers');
      doc.moveDown(0.4);

      currentY = doc.y;
      doc.rect(40, currentY, 532, 20).fill('#F3F4F6');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#374151');
      doc.text('Employee Name', 50, currentY + 6);
      doc.text('Designation', 250, currentY + 6);
      doc.text('Wages / Salary Paid', 400, currentY + 6, { align: 'right', width: 160 });

      currentY += 20;
      doc.font('Helvetica').fontSize(9).fillColor('#4B5563');

      if (salariesPaid.length === 0) {
        doc.rect(40, currentY, 532, 20).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        doc.text('No active staff salary ledger created.', 50, currentY + 6);
        currentY += 20;
      } else {
        salariesPaid.forEach((salary) => {
          doc.rect(40, currentY, 532, 20).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          doc.text(salary.employeeName, 50, currentY + 6);
          doc.text(salary.category, 250, currentY + 6);
          doc.font('Helvetica-Bold').text(`Rs. ${salary.salaryPaid}`, 400, currentY + 6, { align: 'right', width: 160 });
          doc.font('Helvetica');
          currentY += 20;
        });
      }

      // Footer disclaimer
      doc.y = 720;
      doc.fillColor('#9CA3AF').text('________________________________________________________________________________', { align: 'center' });
      doc.moveDown(1);
      doc.font('Helvetica-Oblique').fontSize(8).fillColor('#6B7280').text('This monthly report is an auto-compiled operational and financial ledger.', { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()} | System Administrator`, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
