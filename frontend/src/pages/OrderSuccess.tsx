import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const OrderSuccess = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
    <CheckCircle2 className="text-success mb-4" size={64} />
    <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
    <p className="text-muted-foreground mb-6 text-center max-w-md">
      Thank you for your purchase. Your order has been placed and is being processed. You will receive an email confirmation soon.
    </p>
    <Link to="/" className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition">Back to Home</Link>
  </div>
);

export default OrderSuccess;
