import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { CartItem, Product } from "@shared/schema";

interface CartItemProps {
  item: CartItem & { product: Product };
}

export default function CartItem({ item }: CartItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(item.quantity);

  const updateQuantityMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      await apiRequest("PUT", `/api/cart/${item.id}`, {
        quantity: newQuantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
      setQuantity(item.quantity); // Reset to original quantity
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cart/${item.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item Removed",
        description: `${item.product.name} has been removed from your cart.`,
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
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    updateQuantityMutation.mutate(newQuantity);
  };

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const totalPrice = parseFloat(item.product.price) * quantity;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <Link href={`/products/${item.product.id}`}>
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer"
              />
            </Link>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link href={`/products/${item.product.id}`}>
              <h3 className="font-playfair font-semibold text-lg text-gray-900 cursor-pointer hover:text-burgundy transition-colors">
                {item.product.name}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm mt-1">
              {item.product.fabric} • {item.product.color}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-lg font-bold text-burgundy">
                {formatPrice(item.product.price)}
              </span>
              {item.product.originalPrice && parseFloat(item.product.originalPrice) > parseFloat(item.product.price) && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(item.product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || updateQuantityMutation.isPending}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value);
                if (!isNaN(newQuantity) && newQuantity > 0) {
                  handleQuantityChange(newQuantity);
                }
              }}
              className="w-16 text-center"
              min="1"
              disabled={updateQuantityMutation.isPending}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={updateQuantityMutation.isPending}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Total Price */}
          <div className="text-right">
            <p className="text-lg font-bold text-burgundy">
              {formatPrice(totalPrice.toString())}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-red-600 hover:text-red-800 hover:bg-red-50"
              onClick={() => removeItemMutation.mutate()}
              disabled={removeItemMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
