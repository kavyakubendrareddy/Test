import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
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
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShoppingBag, CreditCard, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { CartItem, Product } from "@shared/schema";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
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

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/profile?tab=orders`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Create order
      const orderData = {
        items: cartItems?.map((item: CartItem & { product: Product }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })) || [],
        shippingAddress,
        totalAmount: calculateTotal(),
      };

      createOrderMutation.mutate(orderData);
      
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! Your order has been placed.",
      });
    }
  };

  const calculateSubtotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total: number, item: CartItem & { product: Product }) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal >= 2000 ? 0 : 150;
    const tax = subtotal * 0.18;
    return subtotal + shipping + tax;
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping & Payment Form */}
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
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={shippingAddress.fullName}
                  onChange={(e) => handleAddressChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                  placeholder="Street address, house number"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={shippingAddress.addressLine2}
                  onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                  placeholder="Apartment, suite, landmark (optional)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="State"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="Postal code"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center font-playfair text-burgundy">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PaymentElement />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-burgundy hover:bg-red-800 text-white"
                  disabled={!stripe || createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Processing..." : `Complete Order - ${formatPrice(calculateTotal())}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="font-playfair text-burgundy">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {cartItems?.map((item: CartItem & { product: Product }) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-burgundy">
                      {formatPrice(parseFloat(item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(calculateSubtotal())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {calculateSubtotal() >= 2000 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(150)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST)</span>
                  <span className="font-semibold">{formatPrice(calculateSubtotal() * 0.18)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-burgundy">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  🔒 Your payment information is encrypted and secure
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function Checkout() {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      // Calculate total amount
      const subtotal = cartItems.reduce((total: number, item: CartItem & { product: Product }) => {
        return total + (parseFloat(item.product.price) * item.quantity);
      }, 0);
      const shipping = subtotal >= 2000 ? 0 : 150;
      const tax = subtotal * 0.18;
      const totalAmount = subtotal + shipping + tax;

      // Create PaymentIntent
      apiRequest("POST", "/api/create-payment-intent", { amount: totalAmount })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [cartItems]);

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4">
                Please Sign In
              </h2>
              <p className="text-gray-600 mb-4">
                You need to be signed in to proceed with checkout.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-burgundy hover:bg-red-800 text-white"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 mb-4">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Link href="/products">
                <Button className="bg-burgundy hover:bg-red-800 text-white">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-burgundy border-t-transparent rounded-full" aria-label="Loading"/>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gray">
      <Header />
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-playfair font-bold text-burgundy mb-8 text-center">
            Checkout
          </h1>
        </div>
        
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      </div>

      {/* Footer */}
      <footer className="bg-burgundy text-white mt-16">
        <div className="traditional-border h-1 bg-gradient-to-r from-gold to-saffron"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-playfair font-bold mb-4">
              <span className="text-gold">स</span>Sarangam
              <span className="text-sm font-devanagari block mt-1">सारंगम्</span>
            </h3>
            <p className="text-red-100 text-sm">
              © 2024 Sarangam. All rights reserved. | Made with ❤️ for Indian textile heritage
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
