
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WishlistItemProps {
  item: {
    id: string;
    product_id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    originalPrice?: number;
  };
  onRemove: (productId: string) => void;
  onAddToCart: (item: any) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove, onAddToCart }) => {
  const productId = item.product_id;
  
  return (
    <div className="flex items-center border-b border-gray-200 py-4">
      <Link to={`/product/${productId}`} className="w-20 h-20 rounded-md overflow-hidden border flex-shrink-0">
        <img src={item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500'} 
          alt={item.name} 
          className="w-full h-full object-cover" 
        />
      </Link>
      
      <div className="ml-4 flex-grow">
        <Link to={`/product/${productId}`} className="font-medium hover:text-blue-600">
          {item.name}
        </Link>
        {item.category && (
          <div className="text-sm text-gray-500">Category: {item.category}</div>
        )}
        <div className="flex items-center mt-1">
          <span className="text-green-600 font-medium">₹{item.price}</span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-sm text-gray-400 line-through ml-2">
              ₹{item.originalPrice}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onAddToCart(item)}
          className="flex items-center"
        >
          <ShoppingBag size={16} className="mr-1" />
          Add to Cart
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemove(productId)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default WishlistItem;
