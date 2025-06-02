import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  MapPin, 
  Calendar,
  Star,
  ExternalLink
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Order, OrderItem, Product, Wishlist } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  // Parse URL parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'orders', 'wishlist', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: wishlistItems, isLoading: wishlistLoading } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const formatPrice = (price: string | number) => {
    return `₹${parseFloat(price.toString()).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="bg-white p-6 rounded-lg space-y-4">
              <div className="h-20 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-warm-gray">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
            <AvatarFallback className="bg-burgundy text-white text-lg">
              {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-playfair font-bold text-burgundy">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.email
              }
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-burgundy">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-lg">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : "Not provided"
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-lg flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(user.createdAt!).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-burgundy">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="text-2xl font-bold text-burgundy">
                      {orders?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Wishlist Items</span>
                    <span className="text-2xl font-bold text-burgundy">
                      {wishlistItems?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="text-2xl font-bold text-burgundy">
                      {formatPrice(
                        orders?.reduce((total, order) => total + parseFloat(order.totalAmount), 0) || 0
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-burgundy">Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                          <div className="h-6 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                    <Link href="/products">
                      <Button className="bg-burgundy hover:bg-red-800 text-white">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: Order & { orderItems: (OrderItem & { product: Product })[] }) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                            <p className="text-gray-600">
                              Placed on {new Date(order.createdAt!).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <Badge className={`ml-2 ${getPaymentStatusColor(order.paymentStatus || 'pending')}`}>
                              {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              <img 
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                              <Link href={`/products/${item.product.id}`}>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {(order.shippingAddress as any)?.fullName}, {(order.shippingAddress as any)?.city}
                          </div>
                          <div className="text-lg font-bold text-burgundy">
                            Total: {formatPrice(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-burgundy">My Wishlist</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlistLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-300 rounded-xl h-48 mb-4"></div>
                        <div className="bg-gray-300 h-4 rounded mb-2"></div>
                        <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : !wishlistItems || wishlistItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items in Wishlist</h3>
                    <p className="text-gray-600 mb-4">Save items you love to your wishlist.</p>
                    <Link href="/products">
                      <Button className="bg-burgundy hover:bg-red-800 text-white">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item: Wishlist & { product: Product }) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="relative">
                          <Link href={`/products/${item.product.id}`}>
                            <img 
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-48 object-cover cursor-pointer"
                            />
                          </Link>
                        </div>
                        <CardContent className="p-4">
                          <Link href={`/products/${item.product.id}`}>
                            <h3 className="font-playfair font-semibold text-lg text-gray-800 mb-2 cursor-pointer hover:text-burgundy transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm mb-3">
                            {item.product.fabric} • {item.product.color}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-burgundy">
                              {formatPrice(item.product.price)}
                            </span>
                            {item.product.rating && parseFloat(item.product.rating) > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">
                                  {parseFloat(item.product.rating).toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-burgundy">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Profile Information</h3>
                    <p className="text-gray-600 text-sm">Update your personal information</p>
                  </div>
                  <Button variant="outline" className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white">
                    Edit Profile
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Email Preferences</h3>
                    <p className="text-gray-600 text-sm">Manage your email notifications</p>
                  </div>
                  <Button variant="outline" className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white">
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Privacy Settings</h3>
                    <p className="text-gray-600 text-sm">Control your privacy preferences</p>
                  </div>
                  <Button variant="outline" className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white">
                    Configure
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-semibold text-red-800">Sign Out</h3>
                    <p className="text-red-600 text-sm">Sign out of your account</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
