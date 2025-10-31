import { useState } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Truck, 
  Shield, 
  Clock,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  Phone,
  Mail,
  User,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AddressBook, type Address } from "@/components/AddressBook";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items: cartItems, getCartCount, getCartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { token } = useAuth() as any;
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discountPercent: number; discountAmount: number } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const steps = [
    { id: 1, title: "Delivery Details", description: "Add delivery information" },
    { id: 2, title: "Payment Method", description: "Choose payment option" },
    { id: 3, title: "Review Order", description: "Confirm your order" },
  ];

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const deliveryFee = deliveryMethod === "express" ? 50 : 30;
  const subtotal = getCartTotal();
  const discountAmount = appliedPromoCode ? Math.round((subtotal * appliedPromoCode.discountPercent) / 100) : 0;
  const totalAmount = subtotal - discountAmount + deliveryFee;

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingPromo(true);
    try {
      const res = await fetch(`${API_BASE}/api/promo-codes/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          orderAmount: subtotal
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Promo Code Error",
          description: data.message || "Invalid promo code",
          variant: "destructive"
        });
        return;
      }

      const discount = Math.round((subtotal * data.discountPercent) / 100);
      setAppliedPromoCode({
        code: data.code,
        discountPercent: data.discountPercent,
        discountAmount: discount
      });
      setPromoCodeInput("");
      toast({
        title: "Promo Code Applied!",
        description: `${data.discountPercent}% discount applied successfully`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCodeInput("");
    toast({
      title: "Promo Code Removed",
      description: "Discount has been removed",
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      setCurrentStep(1);
      return;
    }

    // Collect order details
    const items = cartItems.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.image
    }));
    const total = totalAmount;
    const customerDetails = {
      fullName: selectedAddress.fullName,
      mobile: selectedAddress.mobile,
      address: `${selectedAddress.addressLine1}${selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
    };
    const paymentInfo = { method: paymentMethod };
    const promoCode = appliedPromoCode ? { code: appliedPromoCode.code } : null;
    
    try {
      if (!token) {
        // Not authenticated - redirect to login
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items, total, customerDetails, paymentInfo, promoCode, deliveryFee })
      });
      if (res.status === 401) {
        // token invalid or expired
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }
      if (!res.ok) throw new Error("Order failed");
  // Clear cart and navigate to order success page
  clearCart();
  navigate("/order-success");
    } catch (err) {
      alert("Order failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Checkout</h1>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${
                          currentStep >= step.id 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'border-gray-300 text-gray-500'
                        }`}>
                          {currentStep > step.id ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-xs sm:text-sm font-medium">{step.id}</span>
                          )}
                        </div>
                        <div className="ml-2 sm:ml-3">
                          <p className={`text-xs sm:text-sm font-medium ${
                            currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500">{step.description}</p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-10 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                          currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Delivery Details */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Delivery Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address Selection */}
                  <AddressBook
                    onSelect={setSelectedAddress}
                    selectedId={selectedAddress?._id}
                  />

                  {/* Selected Address Summary */}
                  {selectedAddress && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Selected Delivery Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1">
                          <p className="font-medium">{selectedAddress.fullName}</p>
                          <p className="text-muted-foreground">{selectedAddress.mobile}</p>
                          <p>{selectedAddress.addressLine1}</p>
                          {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
                          <p>{`${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Delivery Method */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Delivery Method</Label>
                    <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="standard" id="standard" />
                        <div className="flex-1">
                          <Label htmlFor="standard" className="flex items-center space-x-2">
                            <Truck className="h-4 w-4" />
                            <span>Standard Delivery (2-3 days)</span>
                          </Label>
                          <p className="text-sm text-gray-500">Rs.30 delivery fee</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="express" id="express" />
                        <div className="flex-1">
                          <Label htmlFor="express" className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Express Delivery (Same day)</span>
                          </Label>
                          <p className="text-sm text-gray-500">Rs.50 delivery fee</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={() => setCurrentStep(2)}
                    className="w-full"
                  >
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="upi" id="upi" />
                        <div className="flex-1">
                          <Label htmlFor="upi" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">UPI</span>
                            </div>
                            <span>UPI Payment</span>
                          </Label>
                          <p className="text-sm text-gray-500">Pay using UPI ID or QR code</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="card" id="card" />
                        <div className="flex-1">
                          <Label htmlFor="card" className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Credit/Debit Card</span>
                          </Label>
                          <p className="text-sm text-gray-500">Visa, Mastercard, RuPay accepted</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <div className="flex-1">
                          <Label htmlFor="wallet" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-green-600">Rs.</span>
                            </div>
                            <span>Digital Wallet</span>
                          </Label>
                          <p className="text-sm text-gray-500">Paytm, PhonePe, Google Pay</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="cod" id="cod" />
                        <div className="flex-1">
                          <Label htmlFor="cod" className="flex items-center space-x-2">
                            <Truck className="h-4 w-4" />
                            <span>Cash on Delivery</span>
                          </Label>
                          <p className="text-sm text-gray-500">Pay when your order arrives</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      className="flex-1"
                    >
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Order Items</h3>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Place Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({getCartCount()} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {appliedPromoCode && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedPromoCode.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Free delivery on orders above Rs.500</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Easy returns within 7 days</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="space-y-2 pt-4 border-t">
                  {appliedPromoCode ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-green-700">{appliedPromoCode.code}</p>
                          <p className="text-xs text-green-600">{appliedPromoCode.discountPercent}% discount applied</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemovePromoCode}
                          className="h-6 w-6 p-0 text-green-700 hover:text-green-900"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Label htmlFor="promo">Promo Code</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="promo" 
                          placeholder="Enter promo code" 
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleApplyPromoCode();
                            }
                          }}
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleApplyPromoCode}
                          disabled={isValidatingPromo || !promoCodeInput.trim()}
                        >
                          {isValidatingPromo ? "..." : "Apply"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
