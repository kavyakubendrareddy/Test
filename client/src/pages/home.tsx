import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Award, Truck, RotateCcw, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", "featured"],
    queryFn: async () => {
      const response = await fetch("/api/products?featured=true&limit=6");
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const occasions = [
    {
      name: "Wedding",
      nameHindi: "विवाह",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      slug: "wedding"
    },
    {
      name: "Festival",
      nameHindi: "त्योहार",
      image: "https://images.unsplash.com/photo-1583391733956-62e3e4e4b780?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      slug: "festival"
    },
    {
      name: "Party",
      nameHindi: "पार्टी",
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      slug: "party"
    },
    {
      name: "Casual",
      nameHindi: "दैनिक",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      slug: "casual"
    }
  ];

  return (
    <div className="min-h-screen bg-warm-gray">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-cream to-rose-gold">
        <div className="saree-pattern absolute inset-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-playfair font-bold text-burgundy mb-6">
                Welcome back, {user?.firstName || 'Beautiful'}!
                <span className="block text-gold font-devanagari text-3xl lg:text-4xl mt-2">
                  स्वागत है
                </span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Discover our latest collection of handwoven sarees that celebrate India's rich textile heritage. 
                Each piece tells a story of craftsmanship passed down through generations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-burgundy hover:bg-red-800 text-white">
                    Explore Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                >
                  Custom Orders
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1583391733981-5efda2d5d3e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
                alt="Elegant traditional Indian sarees displayed in a boutique setting"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <Card className="absolute -bottom-6 -left-6 bg-white p-4 shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-gold to-saffron rounded-full flex items-center justify-center">
                      <Award className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-burgundy">Premium Quality</p>
                      <p className="text-sm text-gray-600">Handpicked Collections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Occasion */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-burgundy mb-4">
              Shop by Occasion
              <span className="block text-xl font-devanagari text-gold mt-2">अवसर के अनुसार खरीदारी</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the perfect saree for every celebration, from intimate gatherings to grand festivities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {occasions.map((occasion, index) => (
              <Link key={index} href={`/products?occasion=${occasion.slug}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img 
                      src={occasion.image}
                      alt={`${occasion.name} sarees collection`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-playfair font-bold text-lg">{occasion.name}</h3>
                      <p className="text-sm font-devanagari">{occasion.nameHindi}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-burgundy mb-4">
                Featured Collection
              </h2>
              <p className="text-gray-600">
                Handpicked premium sarees showcasing the finest craftsmanship
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 rounded-xl h-64 mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts?.products?.slice(0, 6).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-burgundy mb-4">
              Why Choose Sarangam
              <span className="block text-xl font-devanagari text-gold mt-2">हमें क्यों चुनें</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-burgundy to-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-white h-8 w-8" />
              </div>
              <h3 className="font-playfair font-bold text-xl text-burgundy mb-2">Authentic Quality</h3>
              <p className="text-gray-600">Every saree is handpicked and quality-certified by our expert team</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gold to-saffron rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-white h-8 w-8" />
              </div>
              <h3 className="font-playfair font-bold text-xl text-burgundy mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Free shipping across India with secure packaging and tracking</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-deep-teal to-saffron rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="text-white h-8 w-8" />
              </div>
              <h3 className="font-playfair font-bold text-xl text-burgundy mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day hassle-free returns with full refund guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-burgundy text-white">
        <div className="traditional-border h-1 bg-gradient-to-r from-gold to-saffron"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-playfair font-bold mb-4">
                <span className="text-gold">स</span>Sarangam
                <span className="text-sm font-devanagari block mt-1">सारंगम्</span>
              </h3>
              <p className="text-red-100 mb-4 leading-relaxed">
                Celebrating India's rich textile heritage through authentic, handcrafted sarees. 
                We bring you the finest collection from skilled artisans across the country.
              </p>
            </div>

            <div>
              <h4 className="font-playfair font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/profile"><a className="text-red-100 hover:text-gold transition-colors">My Account</a></Link></li>
                <li><Link href="/orders"><a className="text-red-100 hover:text-gold transition-colors">My Orders</a></Link></li>
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">Size Guide</a></li>
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">Care Instructions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-playfair font-bold text-lg mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">Shipping Info</a></li>
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">FAQs</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-red-700 mt-8 pt-8 text-center">
            <p className="text-red-100 text-sm">
              © 2024 Sarangam. All rights reserved. | Made with ❤️ for Indian textile heritage
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
