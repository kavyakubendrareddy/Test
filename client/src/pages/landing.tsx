import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star, Award, Truck, RotateCcw } from "lucide-react";

export default function Landing() {
  const categories = [
    {
      name: "Wedding",
      nameHindi: "विवाह",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      alt: "Luxurious red and gold wedding sarees with intricate embroidery"
    },
    {
      name: "Festival",
      nameHindi: "त्योहार",
      image: "https://images.unsplash.com/photo-1583391733956-62e3e4e4b780?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      alt: "Vibrant festival sarees in bright colors with traditional patterns"
    },
    {
      name: "Party",
      nameHindi: "पार्टी",
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      alt: "Elegant party wear sarees with modern designs and subtle embellishments"
    },
    {
      name: "Casual",
      nameHindi: "दैनिक",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      alt: "Comfortable everyday cotton sarees in soft pastels and simple patterns"
    }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Royal Burgundy Silk Saree",
      description: "Handwoven Banarasi silk with gold zari work",
      price: "₹18,500",
      originalPrice: "₹22,000",
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1583391733981-5efda2d5d3e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
      alt: "Luxurious burgundy silk saree with intricate gold thread embroidery and traditional motifs",
      badge: "Featured"
    },
    {
      id: 2,
      name: "Teal Georgette Party Saree",
      description: "Contemporary design with sequin embellishments",
      price: "₹12,800",
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
      alt: "Elegant teal georgette saree with delicate silver sequin work and contemporary design",
      badge: "New Arrival"
    },
    {
      id: 3,
      name: "Handblock Cotton Saree",
      description: "Natural dyes with traditional block printing",
      price: "₹4,200",
      rating: 4.9,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
      alt: "Traditional cream cotton saree with hand-block printed floral patterns and natural dyes",
      badge: "Eco-Friendly"
    }
  ];

  const reviews = [
    {
      name: "Priya Sharma",
      initials: "PS",
      text: "Beautiful quality saree! The fabric is exactly as described and the delivery was super fast. Highly recommend Sarangam for authentic Indian wear."
    },
    {
      name: "Anita Mehta",
      initials: "AM",
      text: "Excellent customer service and gorgeous collection. The saree I ordered for my daughter's wedding was perfect. Thank you Sarangam!"
    },
    {
      name: "Rekha Kumar",
      initials: "RK",
      text: "Amazing quality and beautiful designs. The website is so easy to use and the filters helped me find exactly what I was looking for."
    }
  ];

  return (
    <div className="min-h-screen bg-warm-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-gold sticky top-0 z-50">
        <div className="traditional-border h-1"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-playfair font-bold text-burgundy">
                <span className="text-gold">स</span>Sarangam
              </h1>
              <span className="ml-2 text-sm text-gray-600 font-devanagari">सारंगम्</span>
            </div>

            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <div className="relative">
                <input 
                  type="search" 
                  placeholder="Search by fabric, color, occasion..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                />
                <ShoppingBag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-burgundy font-medium transition-colors">Collections</a>
              <a href="#" className="text-gray-700 hover:text-burgundy font-medium transition-colors">Occasions</a>
              <a href="#" className="text-gray-700 hover:text-burgundy font-medium transition-colors">Designers</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 relative">
                <ShoppingBag className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-burgundy">3</Badge>
              </Button>
              <Button 
                className="bg-burgundy hover:bg-red-800 text-white"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-cream to-rose-gold">
        <div className="saree-pattern absolute inset-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl lg:text-6xl font-playfair font-bold text-burgundy mb-6">
                Timeless Elegance
                <span className="block text-gold font-devanagari text-3xl lg:text-4xl mt-2">
                  शाश्वत सुंदरता
                </span>
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Discover our curated collection of handwoven sarees that celebrate India's rich textile heritage. 
                Each piece tells a story of craftsmanship passed down through generations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-burgundy hover:bg-red-800 text-white"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Explore Collection
                </Button>
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

      {/* Featured Categories */}
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
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img 
                    src={category.image}
                    alt={category.alt}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-playfair font-bold text-lg">{category.name}</h3>
                    <p className="text-sm font-devanagari">{category.nameHindi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-burgundy mb-4">
              Featured Collection
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked sarees showcasing the finest craftsmanship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="product-card bg-white overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.image}
                    alt={product.alt}
                    className="w-full h-64 object-cover"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full p-0 shadow-sm hover:bg-gray-50"
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Badge className="absolute bottom-4 left-4 bg-burgundy text-white">
                    {product.badge}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-playfair font-semibold text-lg text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-burgundy">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-burgundy hover:bg-red-800 text-white"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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

          {/* Customer Reviews */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-playfair font-bold text-burgundy text-center mb-8">Customer Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <Card key={index} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-burgundy to-rose-gold rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{review.initials}</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-gray-800">{review.name}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{review.text}"</p>
                  </CardContent>
                </Card>
              ))}
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
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">About Us</a></li>
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">Size Guide</a></li>
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">Care Instructions</a></li>
                <li><a href="#" className="text-red-100 hover:text-gold transition-colors">Bulk Orders</a></li>
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
