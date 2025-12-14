import express from "express";
import jwt from "jsonwebtoken";
import { Order } from "../models/Order.js";

const router = express.Router();

// Generate invoice HTML for an order
// Supports both authenticated access (with token) and public access (with orderId + mobile)
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { mobile, token } = req.query;
    
    let order;
    const JWT_SECRET = process.env.JWT_SECRET;
    
    // Try authenticated access first (if token is provided in header or query)
    const authHeader = req.headers.authorization;
    const authToken = token || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
    
    if (authToken && JWT_SECRET) {
      try {
        const decoded = jwt.verify(authToken, JWT_SECRET);
        const userId = decoded.uid;
        const userRole = decoded.role;
        
        // Try to find order for this user
        order = await Order.findOne({ orderId, userId }).populate('items.productId');
        
        // If not found and user is admin/superadmin, allow access to any order
        if (!order && (userRole === 'admin' || userRole === 'superadmin')) {
          order = await Order.findOne({ orderId }).populate('items.productId');
        }
      } catch (authErr) {
        // Auth failed, will try public access below
        console.log("Auth verification failed:", authErr.message);
      }
    }
    
    // If not found via auth, try public access with mobile verification
    if (!order && mobile) {
      order = await Order.findOne({ 
        orderId, 
        "customerDetails.mobile": String(mobile) 
      }).populate('items.productId');
    }
    
    if (!order) {
      return res.status(404).send(`
        <html>
          <head><title>Invoice Not Found</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>Invoice Not Found</h1>
            <p>Order not found. Please ensure you are logged in or provide your mobile number.</p>
            <p style="color: #666; margin-top: 20px;">Order ID: ${orderId}</p>
          </body>
        </html>
      `);
    }

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHTML(order);

    // Set headers for HTML response
    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHtml);
  } catch (err) {
    console.error("Invoice generation error:", err);
    res.status(500).json({ message: "Failed to generate invoice", error: err?.message || String(err) });
  }
});

// Generate invoice HTML template
function generateInvoiceHTML(order) {
  const orderDate = new Date(order.createdAt || order.placedAt || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subtotal = order.subtotalBeforeDiscount || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = order.promoCode?.discountAmount || 0;
  const deliveryFee = order.total - subtotal + discount;
  const tax = 0; // GST can be added if needed
  const total = order.total;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">
        <div style="font-weight: 600; color: #111827;">${item.name || 'Product'}</div>
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-top: 8px;">` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">Rs. ${Number(item.price).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">Rs. ${(Number(item.price) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.orderId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f9fafb;
      color: #111827;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #000;
    }
    .company-info h1 {
      font-size: 28px;
      font-weight: 700;
      color: #000;
      margin-bottom: 8px;
    }
    .company-info p {
      color: #6b7280;
      font-size: 14px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      font-size: 24px;
      font-weight: 700;
      color: #000;
      margin-bottom: 8px;
    }
    .invoice-info p {
      color: #6b7280;
      font-size: 14px;
      margin: 4px 0;
    }
    .details-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .detail-box h3 {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .detail-box p {
      color: #111827;
      font-size: 15px;
      margin: 4px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      background: #000;
      color: white;
    }
    thead th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th:last-child {
      text-align: right;
    }
    thead th:nth-child(2),
    thead th:nth-child(3) {
      text-align: center;
    }
    tbody tr:hover {
      background: #f9fafb;
    }
    .summary {
      margin-top: 30px;
      margin-left: auto;
      width: 300px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 15px;
    }
    .summary-row:last-child {
      border-bottom: none;
    }
    .summary-label {
      color: #6b7280;
    }
    .summary-value {
      font-weight: 600;
      color: #111827;
    }
    .total-row {
      margin-top: 10px;
      padding-top: 15px;
      border-top: 2px solid #000;
      font-size: 18px;
      font-weight: 700;
    }
    .total-row .summary-label {
      color: #000;
    }
    .total-row .summary-value {
      color: #000;
      font-size: 20px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      background: #000;
      color: white;
      margin-top: 8px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
    @media (max-width: 768px) {
      .details-section {
        grid-template-columns: 1fr;
        gap: 30px;
      }
      .header {
        flex-direction: column;
        gap: 20px;
      }
      .invoice-info {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>MDMart</h1>
        <p>Your Premium Grocery Store</p>
        <p>Email: support@mdmart.com</p>
        <p>Phone: +91 1234567890</p>
      </div>
      <div class="invoice-info">
        <h2>INVOICE</h2>
        <p><strong>Invoice #:</strong> ${order.orderId}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <div class="status-badge">${order.status || 'Placed'}</div>
      </div>
    </div>

    <div class="details-section">
      <div class="detail-box">
        <h3>Bill To</h3>
        <p><strong>${order.customerDetails?.fullName || order.customerDetails?.name || 'Customer'}</strong></p>
        <p>${order.customerDetails?.mobile || 'N/A'}</p>
        <p style="margin-top: 8px; color: #6b7280;">${order.address || 'Address not provided'}</p>
      </div>
      <div class="detail-box">
        <h3>Payment Information</h3>
        <p><strong>Payment Method:</strong> ${order.paymentMode || 'COD'}</p>
        <p><strong>Payment Status:</strong> ${order.paymentStatus || 'Pending'}</p>
        ${order.transactionId ? `<p><strong>Transaction ID:</strong> ${order.transactionId}</p>` : ''}
        ${order.assignedDeliveryPartner ? `<p><strong>Delivery Partner:</strong> Assigned</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span class="summary-label">Subtotal</span>
        <span class="summary-value">Rs. ${subtotal.toFixed(2)}</span>
      </div>
      ${discount > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Discount (${order.promoCode?.code || 'Promo'})</span>
        <span class="summary-value">- Rs. ${discount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${deliveryFee > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Delivery Fee</span>
        <span class="summary-value">Rs. ${deliveryFee.toFixed(2)}</span>
      </div>
      ` : ''}
      ${tax > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Tax (GST)</span>
        <span class="summary-value">Rs. ${tax.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="summary-row total-row">
        <span class="summary-label">Total</span>
        <span class="summary-value">Rs. ${total.toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <p><strong>Thank you for your business!</strong></p>
      <p style="margin-top: 8px;">For any queries, please contact our support team.</p>
      <p style="margin-top: 4px;">This is a computer-generated invoice and does not require a signature.</p>
    </div>
  </div>

  <script>
    // Auto-print option (can be enabled)
    // window.onload = function() {
    //   window.print();
    // }
  </script>
</body>
</html>
  `;
}

export default router;

