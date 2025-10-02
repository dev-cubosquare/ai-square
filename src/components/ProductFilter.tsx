import { categories } from '@/data/products';

interface ProductFilterProps {
  onFilterChange: (category: string) => void;
  currentCategory: string;
}

export function ProductFilter({ onFilterChange, currentCategory }: ProductFilterProps) {
  const handleClick = (categoryId: string) => {
    onFilterChange(categoryId);
    // Call global filter function if available
    if (typeof (window as any).filterProducts === 'function') {
      (window as any).filterProducts(categoryId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleClick(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentCategory === category.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
