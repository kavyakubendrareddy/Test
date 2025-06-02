import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  IndianRupee,
  Star,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import type { Product, Category, Order, OrderItem, User as UserType } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    fabric: '',
    color: '',
    region: '',
    occasion: '',
    price: '',
    originalPrice: '',
    imageUrl: '',
    categoryId: '',
    featured: false,
    inStock: true,
    stockQuantity: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameHindi: '',
    slug: '',
    description: '',
    imageUrl: '',
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", "admin"],
    queryFn: async () => {
      const response = await fetch("/api/products?limit=100");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user?.isAdmin,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders", "all"],
    queryFn: async () => {
      const response = await fetch("/api/orders?all=true");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setProductDialogOpen(false);
      resetProductForm();
      toast({
        title: "Success",
        description: "Product created successfully.",
      });
    },
    onError: handleError,
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      setEditingProduct(null);
      resetProductForm();
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
    },
    onError: handleError,
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    },
    onError: handleError,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      await apiRequest("POST", "/api/categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setCategoryDialogOpen(false);
      resetCategoryForm();
      toast({
        title: "Success",
        description: "Category created successfully.",
      });
    },
    onError: handleError,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    },
    onError: handleError,
  });

  function handleError(error: any) {
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
      description: "Operation failed. Please try again.",
      variant: "destructive",
    });
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      fabric: '',
      color: '',
      region: '',
      occasion: '',
      price: '',
      originalPrice: '',
      imageUrl: '',
      categoryId: '',
      featured: false,
      inStock: true,
      stockQuantity: 0,
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      nameHindi: '',
      slug: '',
      description: '',
      imageUrl: '',
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      fabric: product.fabric,
      color: product.color,
      region: product.region || '',
      occasion: product.occasion || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      imageUrl: product.imageUrl,
      categoryId: product.categoryId?.toString() || '',
      featured: product.featured || false,
      inStock: product.inStock || true,
      stockQuantity: product.stockQuantity || 0,
    });
    setProductDialogOpen(true);
  };

  const handleProductSubmit = () => {
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : null,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleCategorySubmit = () => {
    createCategoryMutation.mutate(categoryForm);
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

  if (isLoading || (!user?.isAdmin && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-burgundy border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-warm-gray">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-burgundy mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your saree store</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-8 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-3xl font-bold text-burgundy">{stats?.totalProducts || 0}</p>
                      </div>
                      <Package className="h-8 w-8 text-burgundy" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-3xl font-bold text-burgundy">{stats?.totalOrders || 0}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-burgundy" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-3xl font-bold text-burgundy">
                          {formatPrice(stats?.totalRevenue || 0)}
                        </p>
                      </div>
                      <IndianRupee className="h-8 w-8 text-burgundy" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                        <p className="text-3xl font-bold text-burgundy">{stats?.pendingOrders || 0}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-burgundy" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-burgundy">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.slice(0, 5).map((order: Order & { orderItems: (OrderItem & { product: Product })[] }) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{(order.shippingAddress as any)?.fullName || 'N/A'}</TableCell>
                          <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt!).toLocaleDateString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-burgundy">Products</h2>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-burgundy hover:bg-red-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-playfair text-burgundy">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fabric">Fabric</Label>
                      <Input
                        id="fabric"
                        value={productForm.fabric}
                        onChange={(e) => setProductForm(prev => ({ ...prev, fabric: e.target.value }))}
                        placeholder="Silk, Cotton, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={productForm.color}
                        onChange={(e) => setProductForm(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="Red, Blue, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={productForm.region}
                        onChange={(e) => setProductForm(prev => ({ ...prev, region: e.target.value }))}
                        placeholder="Banarasi, Kanjeevaram, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="occasion">Occasion</Label>
                      <Input
                        id="occasion"
                        value={productForm.occasion}
                        onChange={(e) => setProductForm(prev => ({ ...prev, occasion: e.target.value }))}
                        placeholder="Wedding, Festival, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={productForm.categoryId} 
                        onValueChange={(value) => setProductForm(prev => ({ ...prev, categoryId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={productForm.stockQuantity}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={productForm.featured}
                          onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, featured: checked }))}
                        />
                        <Label>Featured</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={productForm.inStock}
                          onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, inStock: checked }))}
                        />
                        <Label>In Stock</Label>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Product description"
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleProductSubmit}
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      className="bg-burgundy hover:bg-red-800 text-white"
                    >
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {productsLoading ? (
                  <div className="p-6">
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsData?.products?.map((product: Product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-600">{product.fabric} • {product.color}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {categories?.find((c: Category) => c.id === product.categoryId)?.name || 'N/A'}
                          </TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>{product.stockQuantity || 0}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {product.featured && (
                                <Badge className="bg-gold text-white">Featured</Badge>
                              )}
                              <Badge className={product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link href={`/products/${product.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                                disabled={deleteProductMutation.isPending}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair font-bold text-burgundy">Categories</h2>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-burgundy hover:bg-red-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-playfair text-burgundy">Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Name</Label>
                      <Input
                        id="categoryName"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Category name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryNameHindi">Name (Hindi)</Label>
                      <Input
                        id="categoryNameHindi"
                        value={categoryForm.nameHindi}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, nameHindi: e.target.value }))}
                        placeholder="Category name in Hindi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categorySlug">Slug</Label>
                      <Input
                        id="categorySlug"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="category-slug"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryImageUrl">Image URL</Label>
                      <Input
                        id="categoryImageUrl"
                        value={categoryForm.imageUrl}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Textarea
                        id="categoryDescription"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Category description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCategorySubmit}
                      disabled={createCategoryMutation.isPending}
                      className="bg-burgundy hover:bg-red-800 text-white"
                    >
                      Create Category
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesLoading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-300 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                categories?.map((category: Category) => (
                  <Card key={category.id}>
                    {category.imageUrl && (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-playfair font-semibold text-lg text-burgundy mb-1">
                        {category.name}
                      </h3>
                      {category.nameHindi && (
                        <p className="text-sm text-gray-600 font-devanagari mb-2">
                          {category.nameHindi}
                        </p>
                      )}
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-burgundy">All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.map((order: Order & { orderItems: (OrderItem & { product: Product })[] }) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{(order.shippingAddress as any)?.fullName || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{(order.shippingAddress as any)?.city}</p>
                            </div>
                          </TableCell>
                          <TableCell>{order.orderItems.length} items</TableCell>
                          <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatusMutation.mutate({ orderId: order.id, status: value })}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt!).toLocaleDateString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
