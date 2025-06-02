import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Truck, 
  RotateCcw, 
  Shield, 
  Minus, 
  Plus,
  ChevronLeft
} from "lucide-react";
import { Link } from "wouter";
import type { Product, Review, User } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const { data: product, isLoading: productLoading, error } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/products/${id}/reviews`],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: parseInt(id!),
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${quantity} ${product?.name} added to your cart.`,
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
        await apiRequest("DELETE", `/api/wishlist/${id}`);
      } else {
        await apiRequest("POST", "/api/wishlist", {
          productId: parseInt(id!),
        });
      }
    },
    onSuccess: () => {
      setIsWishlisted(!isWishlisted);
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
        description: `${product?.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
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

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
      setReviewComment('');
      setReviewRating(5);
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
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
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-300 rounded-xl h-96"></div>
              <div className="space-y-4">
                <div className="bg-gray-300 h-8 rounded w-3/4"></div>
                <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                <div className="bg-gray-300 h-6 rounded w-1/4"></div>
                <div className="bg-gray-300 h-20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4">
                Product Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/products">
                <Button className="bg-burgundy hover:bg-red-800 text-white">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const images = [product.imageUrl, ...(product.additionalImages || [])];
  const totalPrice = parseFloat(product.price) * quantity;

  return (
    <div className="min-h-screen bg-warm-gray">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="p-0 h-auto font-normal">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Products
            </Button>
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
              />
              {product.featured && (
                <Badge className="absolute top-4 left-4 bg-burgundy text-white">
                  Featured
                </Badge>
              )}
              {!product.inStock && (
                <Badge className="absolute top-4 right-4 bg-red-600 text-white">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-burgundy' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-burgundy mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            {product.rating && parseFloat(product.rating) > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(parseFloat(product.rating!))
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  {parseFloat(product.rating).toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-burgundy">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)}% Off
                  </Badge>
                </>
              )}
            </div>

            {/* Product Specifications */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-cream rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Fabric</span>
                <p className="font-semibold text-burgundy">{product.fabric}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Color</span>
                <p className="font-semibold text-burgundy">{product.color}</p>
              </div>
              {product.region && (
                <div>
                  <span className="text-sm text-gray-600">Region</span>
                  <p className="font-semibold text-burgundy">{product.region}</p>
                </div>
              )}
              {product.occasion && (
                <div>
                  <span className="text-sm text-gray-600">Occasion</span>
                  <p className="font-semibold text-burgundy">{product.occasion}</p>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-lg font-bold text-burgundy ml-auto">
                  Total: {formatPrice(totalPrice.toString())}
                </span>
              </div>

              <div className="flex space-x-4">
                <Button
                  size="lg"
                  className="flex-1 bg-burgundy hover:bg-red-800 text-white"
                  onClick={() => addToCartMutation.mutate()}
                  disabled={addToCartMutation.isPending || !product.inStock}
                >
                  {addToCartMutation.isPending ? (
                    "Adding..."
                  ) : !product.inStock ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => toggleWishlistMutation.mutate()}
                  disabled={toggleWishlistMutation.isPending}
                  className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-8 w-8 text-burgundy mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over ₹2,000</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-8 w-8 text-burgundy mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day return policy</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-burgundy mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Authentic</p>
                <p className="text-xs text-gray-600">Quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="care">Care Instructions</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-playfair font-bold text-xl text-burgundy mb-4">
                    Product Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || "This beautiful saree represents the finest in traditional Indian craftsmanship. Each piece is carefully handwoven by skilled artisans using time-honored techniques passed down through generations."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="care" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-playfair font-bold text-xl text-burgundy mb-4">
                    Care Instructions
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <h4 className="font-semibold mb-2">Washing</h4>
                      <p>Dry clean only for best results. If hand washing, use cold water with mild detergent.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Storage</h4>
                      <p>Store in a cool, dry place away from direct sunlight. Fold carefully or hang to prevent wrinkles.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Ironing</h4>
                      <p>Use low heat setting and iron on the reverse side to protect the fabric and embellishments.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Write Review */}
                {user && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-playfair font-bold text-xl text-burgundy mb-4">
                        Write a Review
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Rating
                          </label>
                          <Select value={reviewRating.toString()} onValueChange={(value) => setReviewRating(parseInt(value))}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 4, 3, 2, 1].map((rating) => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  <div className="flex items-center space-x-1">
                                    <span>{rating}</span>
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Comment
                          </label>
                          <Textarea
                            placeholder="Share your experience with this product..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={() => submitReviewMutation.mutate()}
                          disabled={submitReviewMutation.isPending || !reviewComment.trim()}
                          className="bg-burgundy hover:bg-red-800 text-white"
                        >
                          {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Reviews List */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-playfair font-bold text-xl text-burgundy mb-4">
                      Customer Reviews
                    </h3>
                    {reviewsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                              <div className="bg-gray-300 h-4 w-24 rounded"></div>
                            </div>
                            <div className="bg-gray-300 h-4 w-full rounded"></div>
                            <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : reviews?.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">
                        No reviews yet. Be the first to review this product!
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {reviews?.map((review: Review & { user: User }) => (
                          <div key={review.id} className="border-b pb-6 last:border-b-0">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarImage src={review.user.profileImageUrl} />
                                <AvatarFallback className="bg-burgundy text-white">
                                  {review.user.firstName?.charAt(0) || review.user.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-semibold text-gray-800">
                                    {review.user.firstName && review.user.lastName 
                                      ? `${review.user.firstName} ${review.user.lastName}`
                                      : review.user.email
                                    }
                                  </span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt!).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
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
