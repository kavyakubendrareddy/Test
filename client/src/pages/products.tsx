import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid, List, Filter } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Products() {
  const [location] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: '',
    fabric: '',
    color: '',
    region: '',
    occasion: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    featured: false,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    setFilters(prev => ({
      ...prev,
      category: urlParams.get('category') || '',
      fabric: urlParams.get('fabric') || '',
      color: urlParams.get('color') || '',
      region: urlParams.get('region') || '',
      occasion: urlParams.get('occasion') || '',
      search: urlParams.get('search') || '',
      featured: urlParams.get('featured') === 'true',
    }));
  }, [location]);

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['/api/products', filters, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((currentPage - 1) * itemsPerPage).toString());

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ 
      ...prev, 
      sortBy, 
      sortOrder: sortOrder as 'asc' | 'desc' 
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);

  if (error) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-playfair font-bold text-burgundy mb-4">
                Unable to Load Products
              </h2>
              <p className="text-gray-600 mb-4">
                We're having trouble loading the product catalog. Please try again later.
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories || []}
            />
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-playfair font-bold text-burgundy mb-2">
                  {filters.search ? `Search Results for "${filters.search}"` : 'Our Collection'}
                </h1>
                <p className="text-gray-600">
                  {isLoading ? 'Loading...' : `${productsData?.total || 0} products found`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-burgundy text-white' : ''}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-burgundy text-white' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort Dropdown */}
                <Select onValueChange={handleSortChange} defaultValue="createdAt-desc">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating-desc">Highest Rated</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(itemsPerPage)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="h-64 w-full rounded-xl mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : productsData?.products?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-playfair font-bold text-burgundy mb-4">
                    No Products Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any products matching your criteria. 
                    Try adjusting your filters or search terms.
                  </p>
                  <Button 
                    onClick={() => {
                      setFilters({
                        category: '',
                        fabric: '',
                        color: '',
                        region: '',
                        occasion: '',
                        minPrice: '',
                        maxPrice: '',
                        search: '',
                        featured: false,
                        sortBy: 'createdAt',
                        sortOrder: 'desc',
                      });
                      setCurrentPage(1);
                    }}
                    variant="outline"
                    className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {productsData?.products?.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? "bg-burgundy text-white" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
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
