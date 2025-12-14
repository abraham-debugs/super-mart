import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <CheckCircle2 className="text-success mb-4" size={64} />
      <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Thank you for your purchase. Your order has been placed and is being processed. You will receive an email confirmation soon.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link to="/" className="inline-block px-6 py-3 rounded-full bg-black text-white font-semibold shadow hover:bg-gray-800 transition">
          Back to Home
        </Link>
        {orderId && (
          <Button
            variant="outline"
            className="px-6 py-3 rounded-full bg-white text-black border-black hover:bg-gray-100"
            onClick={async () => {
              // Get token from localStorage
              const token = localStorage.getItem('token') || '';
              const invoiceUrl = `${API_BASE}/api/invoices/${orderId}?token=${encodeURIComponent(token)}`;
              window.open(invoiceUrl, '_blank');
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Invoice
          </Button>
        )}
        <Link to="/profile" className="inline-block px-6 py-3 rounded-full border border-black text-black font-semibold hover:bg-gray-50 transition">
          View Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
