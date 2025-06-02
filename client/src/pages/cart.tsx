import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import CartItem from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { CartItem as CartItemType, Product } from "@shared/schema";

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading, error } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
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
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const calculateSubtotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total: number, item: CartItemType & { product: Product }) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal >= 2000 ? 0 : 150; // Free shipping over ₹2000
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg">
                <div className="flex space-x-4">
                  <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4">
                Unable to Load Cart
              </h2>
              <p className="text-gray-600 mb-4">
                We're having trouble loading your cart. Please try again later.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-burgundy hover:bg-red-800 text-white"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gray">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-playfair font-bold text-burgundy">
            Shopping Cart
          </h1>
          {cartItems && cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearCartMutation.mutate()}
              disabled={clearCartMutation.isPending}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        {!cartItems || cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any items to your cart yet. 
                Discover our beautiful collection of sarees.
              </p>
              <Link href="/products">
                <Button className="bg-burgundy hover:bg-red-800 text-white">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: CartItemType & { product: Product }) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="font-playfair text-burgundy">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  
                  {shipping > 0 && (
                    <p className="text-sm text-gray-500">
                      Add {formatPrice(2000 - subtotal)} more for free shipping
                    </p>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-semibold">{formatPrice(tax)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-burgundy">{formatPrice(total)}</span>
                  </div>
                  
                  <Link href="/checkout">
                    <Button 
                      size="lg" 
                      className="w-full bg-burgundy hover:bg-red-800 text-white"
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link href="/products">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
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
