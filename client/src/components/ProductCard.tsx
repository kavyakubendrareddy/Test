import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
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
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await apiRequest("DELETE", `/api/wishlist/${product.id}`);
      } else {
        await apiRequest("POST", "/api/wishlist", {
          productId: product.id,
        });
      }
    },
    onSuccess: () => {
      setIsWishlisted(!isWishlisted);
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
        description: `${product.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
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
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const getBadgeVariant = () => {
    if (product.featured) return "default";
    if (product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price)) return "secondary";
    return "outline";
  };

  const getBadgeText = () => {
    if (product.featured) return "Featured";
    if (product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price)) {
      const discount = Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100);
      return `${discount}% Off`;
    }
    return "New";
  };

  return (
    <Card className="product-card bg-white overflow-hidden">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img 
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-64 object-cover cursor-pointer"
          />
        </Link>
        <Button 
          variant="ghost" 
          size="sm"
          className={`absolute top-4 right-4 w-8 h-8 bg-white rounded-full p-0 shadow-sm hover:bg-gray-50 ${
            isWishlisted ? 'text-red-500' : 'text-gray-600'
          }`}
          onClick={() => toggleWishlistMutation.mutate()}
          disabled={toggleWishlistMutation.isPending}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>
        <Badge 
          className={`absolute bottom-4 left-4 ${
            product.featured ? 'bg-burgundy text-white' : 
            getBadgeVariant() === 'secondary' ? 'bg-green-600 text-white' : 
            'bg-deep-teal text-white'
          }`}
        >
          {getBadgeText()}
        </Badge>
      </div>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-playfair font-semibold text-lg text-gray-800 mb-2 cursor-pointer hover:text-burgundy transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-burgundy">{formatPrice(product.price)}</span>
            {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {product.rating && parseFloat(product.rating) > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{parseFloat(product.rating).toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            </div>
          )}
        </div>
        <Button 
          className="w-full bg-burgundy hover:bg-red-800 text-white"
          onClick={() => addToCartMutation.mutate()}
          disabled={addToCartMutation.isPending || !product.inStock}
        >
          {addToCartMutation.isPending ? (
            "Adding..."
          ) : !product.inStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
