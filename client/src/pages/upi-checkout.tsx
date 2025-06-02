import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShoppingBag, Smartphone, MapPin, Copy, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { CartItem, Product } from "@shared/schema";

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

const UpiCheckoutForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/create-payment", data);
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentData(data);
      toast({
        title: "Payment Details Generated",
        description: "Please complete the payment using the details below.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate payment details. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed. We'll verify your payment and process it soon.",
      });
      window.location.href = "/profile?tab=orders";
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    if (!cartItems) return 0;
    const subtotal = cartItems.reduce((total: number, item: CartItem & { product: Product }) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
    const shipping = subtotal >= 2000 ? 0 : 150;
    const tax = subtotal * 0.18;
    return subtotal + shipping + tax;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleGeneratePayment = () => {
    // Validate shipping address
    const requiredFields = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof ShippingAddress]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({
      amount: calculateTotal(),
      paymentMethod,
    });
  };

  const handleCompleteOrder = () => {
    if (paymentMethod === 'upi' && !upiTransactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter your UPI transaction ID.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      items: cartItems?.map((item: CartItem & { product: Product }) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      })) || [],
      shippingAddress,
      totalAmount: calculateTotal().toString(),
      paymentMethod,
      paymentDetails: {
        paymentId: paymentData?.paymentId,
        transactionId: upiTransactionId,
      },
    };

    createOrderMutation.mutate(orderData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some beautiful sarees to your cart to proceed with checkout.</p>
          <Link href="/products">
            <Button className="bg-burgundy hover:bg-red-800 text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gray">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-playfair text-burgundy">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                      placeholder="House/Flat number, Street name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                      placeholder="Area, Landmark (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="postalCode">PIN Code *</Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="PIN Code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-playfair text-burgundy">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="upi"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                      className="text-burgundy"
                    />
                    <Label htmlFor="upi" className="flex items-center cursor-pointer">
                      <Smartphone className="h-4 w-4 mr-2" />
                      UPI Payment (PhonePe, Google Pay, Paytm, etc.)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="bank"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'bank')}
                      className="text-burgundy"
                    />
                    <Label htmlFor="bank" className="cursor-pointer">
                      Bank Transfer / NEFT / IMPS
                    </Label>
                  </div>
                </div>

                {!paymentData ? (
                  <Button 
                    onClick={handleGeneratePayment}
                    className="w-full bg-burgundy hover:bg-red-800 text-white"
                    disabled={createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? "Generating..." : "Generate Payment Details"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Payment Details */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                      <h4 className="font-semibold text-blue-900">Payment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Amount:</span>
                          <span className="font-semibold">{formatPrice(paymentData.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Payment ID:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs">{paymentData.paymentId}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(paymentData.paymentId)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {paymentMethod === 'upi' && (
                          <div className="flex justify-between items-center">
                            <span>UPI ID:</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{paymentData.merchantDetails.upiId}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(paymentData.merchantDetails.upiId)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {paymentMethod === 'bank' && (
                          <>
                            <div className="flex justify-between items-center">
                              <span>Account:</span>
                              <span className="font-semibold">{paymentData.merchantDetails.accountNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>IFSC:</span>
                              <span className="font-semibold">{paymentData.merchantDetails.ifscCode}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800">{paymentData.instructions}</p>
                    </div>

                    {/* Transaction ID Input */}
                    {paymentMethod === 'upi' && (
                      <div>
                        <Label htmlFor="transactionId">UPI Transaction ID *</Label>
                        <Input
                          id="transactionId"
                          value={upiTransactionId}
                          onChange={(e) => setUpiTransactionId(e.target.value)}
                          placeholder="Enter 12-digit transaction ID"
                        />
                      </div>
                    )}

                    <Button 
                      onClick={handleCompleteOrder}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Placing Order..." : "Complete Order"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="font-playfair text-burgundy">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems?.map((item: CartItem & { product: Product }) => (
                    <div key={item.id} className="flex space-x-3">
                      <img
                        src={item.product.imageUrl || "/placeholder-saree.jpg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-xs text-gray-500">
                          {item.product.color} • {item.product.fabric}
                        </p>
                        <p className="text-sm font-medium">
                          {formatPrice(parseFloat(item.product.price))} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartItems?.reduce((total: number, item: CartItem & { product: Product }) => 
                      total + (parseFloat(item.product.price) * item.quantity), 0) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{(cartItems?.reduce((total: number, item: CartItem & { product: Product }) => 
                      total + (parseFloat(item.product.price) * item.quantity), 0) || 0) >= 2000 ? 'Free' : formatPrice(150)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (18% GST)</span>
                    <span>{formatPrice((cartItems?.reduce((total: number, item: CartItem & { product: Product }) => 
                      total + (parseFloat(item.product.price) * item.quantity), 0) || 0) * 0.18)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    🔒 Your payment and personal information is secure
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpiCheckoutForm;