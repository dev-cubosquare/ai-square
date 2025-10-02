import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/data/products';
import { statusLabels } from '@/data/products';
import * as LucideIcons from 'lucide-react';

interface Props {
  product: Product;
}

export function ProductCardInteractive({ product }: Props) {
  const IconComponent = (LucideIcons as any)[product.icon] || LucideIcons.Box;

  const handleClick = (e: React.MouseEvent) => {
    if (!product.landingPageUrl || product.landingPageUrl === '') {
      e.preventDefault();
      console.log('testing')
      toast.info('Coming Soon', {
        description: `${product.name} is launching soon. Stay tuned!`,
        duration: 3000,
      });
    }
  };

  const isDisabled = !product.landingPageUrl || product.landingPageUrl === '';
  const linkProps = isDisabled
    ? {}
    : {
        href: product.landingPageUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
      };

  return (
    <a
      {...linkProps}
      onClick={handleClick}
      className={`group block h-full transition-all duration-300 ${!isDisabled ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'}`}
    >
      <div className="h-full rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50">
        <div className="p-6 space-y-4">
          {/* Icon & Status Badge */}
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <Badge
              variant={product.status === 'live' ? 'default' : product.status === 'beta' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {statusLabels[product.status]}
            </Badge>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className={`text-xl font-semibold leading-tight transition-colors ${!isDisabled ? 'group-hover:text-primary' : ''}`}>
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Learn More Link / Coming Soon */}
          <div className={`flex items-center text-sm font-medium transition-transform ${!isDisabled ? 'text-primary group-hover:translate-x-1' : 'text-muted-foreground'}`}>
            {isDisabled ? (
              <>
                Coming Soon
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            ) : (
              <>
                Learn more
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
