import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ShoppingBag, Search, User, Settings, LogOut, Package, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: wishlistItems } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <header className="bg-white shadow-sm border-b-2 border-gold sticky top-0 z-50">
      <div className="traditional-border h-1"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <h1 className="text-2xl font-playfair font-bold text-burgundy">
                <span className="text-gold">स</span>Sarangam
              </h1>
              <span className="ml-2 text-sm text-gray-600 font-devanagari">सारंगम्</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input 
                type="search" 
                placeholder="Search by fabric, color, occasion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-burgundy"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/products">
              <a className="text-gray-700 hover:text-burgundy font-medium transition-colors">Collections</a>
            </Link>
            <Link href="/products?featured=true">
              <a className="text-gray-700 hover:text-burgundy font-medium transition-colors">Featured</a>
            </Link>
            {user?.isAdmin && (
              <Link href="/admin">
                <a className="text-gray-700 hover:text-burgundy font-medium transition-colors">Admin</a>
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Heart className="h-5 w-5 text-gray-700 hover:text-burgundy transition-colors" />
                {wishlistItems && wishlistItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-burgundy p-0 flex items-center justify-center">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <ShoppingBag className="h-5 w-5 text-gray-700 hover:text-burgundy transition-colors" />
                {cartItems && cartItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-burgundy p-0 flex items-center justify-center">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-burgundy text-white">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email
                      }
                    </p>
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t"></div>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <div className="flex items-center cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <div className="flex items-center cursor-pointer w-full">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <div className="flex items-center cursor-pointer w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <div className="border-t"></div>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
