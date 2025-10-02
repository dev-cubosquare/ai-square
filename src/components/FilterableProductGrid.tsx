import { useState, useMemo } from 'react';
import { ProductCardInteractive } from './ProductCardInteractive';
import { products } from '@/data/products';
import type { Product } from '@/data/products';
import { Toaster } from './ui/sonner';

interface FilterableProductGridProps {
  initialCategory?: string;
}

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'ai-assistant', label: 'AI Assistants' },
  { id: 'recruitment', label: 'Recruitment' },
  { id: 'communication', label: 'Communication' },
  { id: 'automation', label: 'Automation' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'creative', label: 'Creative' },
  { id: 'other', label: 'Other' },
];

export function FilterableProductGrid({ initialCategory = 'all' }: FilterableProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter((product) => product.category === selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    // Update URL
    const url = new URL(window.location.href);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({}, '', url);
  };

  return (
    <>
      {/* Filter Section */}
      <section className="py-8 sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground ml-4">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCardInteractive key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No products found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
