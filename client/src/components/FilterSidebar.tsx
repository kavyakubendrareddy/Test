import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { X, Filter } from "lucide-react";
import type { Category } from "@shared/schema";

interface FilterSidebarProps {
  filters: {
    category: string;
    fabric: string;
    color: string;
    region: string;
    occasion: string;
    minPrice: string;
    maxPrice: string;
    search: string;
    featured: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onFilterChange: (filters: Partial<typeof filters>) => void;
  categories: Category[];
}

export default function FilterSidebar({ filters, onFilterChange, categories }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([
    parseInt(filters.minPrice) || 0,
    parseInt(filters.maxPrice) || 100000
  ]);

  const fabrics = [
    'Silk',
    'Cotton',
    'Georgette',
    'Chiffon',
    'Crepe',
    'Net',
    'Satin',
    'Organza'
  ];

  const colors = [
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Pink',
    'Purple',
    'Orange',
    'Black',
    'White',
    'Gold',
    'Silver',
    'Maroon'
  ];

  const regions = [
    'Banarasi',
    'Kanjeevaram',
    'Chanderi',
    'Bandhani',
    'Paithani',
    'Pochampally',
    'Sambalpuri',
    'Maheshwari',
    'Mysore',
    'Gadwal'
  ];

  const occasions = [
    'Wedding',
    'Festival',
    'Party',
    'Casual',
    'Office',
    'Traditional',
    'Engagement',
    'Reception'
  ];

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    onFilterChange({
      minPrice: value[0].toString(),
      maxPrice: value[1].toString(),
    });
  };

  const handleCheckboxChange = (filterType: string, value: string, checked: boolean) => {
    if (checked) {
      onFilterChange({ [filterType]: value });
    } else {
      onFilterChange({ [filterType]: '' });
    }
  };

  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    onFilterChange({
      category: '',
      fabric: '',
      color: '',
      region: '',
      occasion: '',
      minPrice: '',
      maxPrice: '',
      featured: false,
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search' || key === 'sortBy' || key === 'sortOrder') return false;
    return value && value !== '' && value !== false;
  });

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-playfair text-burgundy flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-burgundy hover:text-red-800"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Price Range</h4>
          <div className="space-y-3">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={100000}
              min={0}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        {categories && categories.length > 0 && (
          <>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.category === category.id.toString()}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('category', category.id.toString(), checked as boolean)
                      }
                      className="data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Fabric Type */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Fabric</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {fabrics.map((fabric) => (
              <div key={fabric} className="flex items-center space-x-2">
                <Checkbox
                  id={`fabric-${fabric}`}
                  checked={filters.fabric === fabric}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('fabric', fabric, checked as boolean)
                  }
                  className="data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
                />
                <Label
                  htmlFor={`fabric-${fabric}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {fabric}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Color */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Color</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={filters.color === color}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('color', color, checked as boolean)
                  }
                  className="data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
                />
                <Label
                  htmlFor={`color-${color}`}
                  className="text-sm text-gray-700 cursor-pointer flex items-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                    style={{
                      backgroundColor: color.toLowerCase() === 'gold' ? '#DAA520' :
                                     color.toLowerCase() === 'silver' ? '#C0C0C0' :
                                     color.toLowerCase() === 'maroon' ? '#800000' :
                                     color.toLowerCase()
                    }}
                  />
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Region */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Region</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {regions.map((region) => (
              <div key={region} className="flex items-center space-x-2">
                <Checkbox
                  id={`region-${region}`}
                  checked={filters.region === region}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('region', region, checked as boolean)
                  }
                  className="data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
                />
                <Label
                  htmlFor={`region-${region}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {region}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Occasion */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Occasion</h4>
          <div className="space-y-2">
            {occasions.map((occasion) => (
              <div key={occasion} className="flex items-center space-x-2">
                <Checkbox
                  id={`occasion-${occasion}`}
                  checked={filters.occasion === occasion}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('occasion', occasion, checked as boolean)
                  }
                  className="data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
                />
                <Label
                  htmlFor={`occasion-${occasion}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {occasion}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Featured */}
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured}
              onCheckedChange={(checked) =>
                onFilterChange({ featured: checked as boolean })
              }
              className="data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
            />
            <Label htmlFor="featured" className="text-sm text-gray-700 cursor-pointer">
              Featured Products Only
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
