
import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CartItem } from '@/pages/Cart';

export interface CartItemListProps {
  cartItems: CartItem[];
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({ 
  cartItems, 
  onRemove,
  onUpdateQuantity
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium mb-4">Items ({cartItems.length})</h2>
      
      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex border-b pb-4">
            <Link to={`/product/${item.product_id}`} className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={item.image || 'https://via.placeholder.com/80'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </Link>
            
            <div className="ml-4 flex-grow">
              <Link to={`/product/${item.product_id}`} className="font-medium hover:text-blue-600">
                {item.name}
              </Link>
              
              {item.size && (
                <div className="text-sm text-gray-600 mt-1">Size: {item.size}</div>
              )}
              
              {item.color && (
                <div className="text-sm text-gray-600">Color: {item.color}</div>
              )}
              
              <div className="text-green-600 font-medium mt-1">₹{item.price}</div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center border rounded-md mb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus size={16} />
                </Button>
                
                <span className="px-2">{item.quantity}</span>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 size={16} className="mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartItemList;
