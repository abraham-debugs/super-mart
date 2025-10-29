import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState("");
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!orderId.trim() || !mobile.trim()) {
      alert("Please enter both Order ID and Mobile Number");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/orders/track?orderId=${encodeURIComponent(orderId)}&mobile=${encodeURIComponent(mobile)}`);
      if (!response.ok) throw new Error("Order not found");
      const data = await response.json();
      setOrderStatus(data);
    } catch (error: any) {
      setOrderStatus({ error: error.message || "Order not found or mobile number does not match" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <Package className="h-6 w-6 text-blue-500" />;
      case "payment_verified":
        return <CreditCard className="h-6 w-6 text-green-500" />;
      case "booked":
        return <Truck className="h-6 w-6 text-purple-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusStep = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return 1;
      case "payment_verified":
        return 2;
      case "booked":
        return 3;
      default:
        return 0;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Your order has been confirmed and is being processed. Please upload your payment screenshot.";
      case "payment_verified":
        return "Payment verified successfully! Your order is being prepared for delivery.";
      case "booked":
        return "Order booked for delivery! Your items are on their way.";
      default:
        return "Order status unknown.";
    }
  };

  const renderProgressBar = (currentStatus: string) => {
    const steps = [
      { name: "Order Confirmed", icon: <Package className="h-5 w-5" />, description: "Order received and confirmed" },
      { name: "Payment Verified", icon: <CreditCard className="h-5 w-5" />, description: "Payment screenshot verified" },
      { name: "Booked for Delivery", icon: <Truck className="h-5 w-5" />, description: "Order booked and dispatched" }
    ];

    const currentStep = getStatusStep(currentStatus);

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
            <div className="h-1 bg-primary rounded-full transition-all duration-500" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
          </div>
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep - 1;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-primary border-primary text-white' : isCurrent ? 'bg-primary/20 border-primary text-primary' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : step.icon}
                  </div>
                  <span className={`text-sm font-medium mt-2 text-center max-w-[80px] ${isCompleted ? 'text-primary' : 'text-gray-500'}`}>{step.name}</span>
                  <span className={`text-xs text-center mt-1 max-w-[80px] opacity-75 ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>{step.description}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(currentStatus)}
            <span className="font-medium text-primary">Current Status: {orderStatus?.status?.toUpperCase()}</span>
          </div>
          <p className="text-sm text-muted-foreground">{getStatusDescription(currentStatus)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order ID to track your order status</p>
          </div>

          <div className="bg-card p-6 rounded-lg border mb-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Enter Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleTrackOrder()} />
                <Input placeholder="Enter Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleTrackOrder()} />
              </div>
              <Button onClick={handleTrackOrder} disabled={loading} className="w-full"><Search className="h-4 w-4 mr-2" />{loading ? "Searching..." : "Track Order"}</Button>
            </div>
          </div>

          {loading && (<div className="text-center py-8"><p>Searching for your order...</p></div>)}

          {orderStatus && !loading && (
            <div className="bg-card p-6 rounded-lg border">
              {orderStatus.error ? (
                <div className="text-center"><p className="text-red-500">{orderStatus.error}</p></div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                  {renderProgressBar(orderStatus.status)}
                  <div className="space-y-4">
                    <div className="flex justify-between"><span className="font-medium">Order ID:</span><span className="font-mono">{orderStatus.orderId}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Customer Name:</span><span>{orderStatus.customerDetails?.fullName}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Mobile Number:</span><span>{orderStatus.customerDetails?.mobile}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Status:</span><div className="flex items-center gap-2">{getStatusIcon(orderStatus.status)}<span className="capitalize font-medium">{orderStatus.status?.replace('_', ' ')}</span></div></div>
                    <div className="flex justify-between"><span className="font-medium">Total Amount:</span><span className="font-semibold text-lg">Rs.{orderStatus.total}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Order Date:</span><span>{new Date(orderStatus.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                    {orderStatus.paymentScreenshot && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-3 text-primary">Payment Information</h4>
                        <div className="flex justify-between"><span className="font-medium">Payment Status:</span><span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatus.paymentScreenshot.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{orderStatus.paymentScreenshot.verified ? 'Verified' : 'Pending Verification'}</span></div>
                        {orderStatus.paymentScreenshot.uploadedAt && (<div className="flex justify-between"><span className="font-medium">Screenshot Uploaded:</span><span>{new Date(orderStatus.paymentScreenshot.uploadedAt).toLocaleDateString()}</span></div>)}
                      </div>
                    )}
                    {(orderStatus.transportName || orderStatus.lrNumber) && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-3 text-primary">Shipping Information</h4>
                        {orderStatus.transportName && (<div className="flex justify-between"><span className="font-medium">Transport Name:</span><span>{orderStatus.transportName}</span></div>)}
                        {orderStatus.lrNumber && (<div className="flex justify-between"><span className="font-medium">LR Number:</span><span className="font-mono">{orderStatus.lrNumber}</span></div>)}
                      </div>
                    )}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3 text-primary">Next Steps</h4>
                      {orderStatus.status === 'confirmed' && (<p className="text-sm text-muted-foreground">Please upload your payment screenshot to proceed with your order.</p>)}
                      {orderStatus.status === 'payment_verified' && (<p className="text-sm text-muted-foreground">Your payment has been verified. We're preparing your order for delivery.</p>)}
                      {orderStatus.status === 'booked' && (<p className="text-sm text-muted-foreground">Your order has been booked for delivery. You'll receive updates on the delivery status.</p>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackOrder;
