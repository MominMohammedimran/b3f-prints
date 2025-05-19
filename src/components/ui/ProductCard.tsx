
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { useCartFunctions } from '@/hooks/useCartFunctions';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart, isLoading } = useCartFunctions();
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const success = await addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      });
      
      if (success) {
        toast.success(`${product.name} added to cart`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const getDiscountBadge = () => {
    if (!product.discountPercentage) return null;
    
    return (
      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
        {product.discountPercentage}% OFF
      </div>
    );
  };

  return (
    <div 
      className="group bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {getDiscountBadge()}
        
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-end justify-center">
          <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-200 w-full p-2 bg-gradient-to-t from-black/70 to-transparent">
            <Button 
              className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading}
            >
              <ShoppingCart size={16} className="mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-semibold">
              {formatPrice(product.price)}
            </span>
            
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-500 text-sm line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span className="ml-1 text-xs text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
