
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export const useCartFunctions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart: addToCartContext, removeFromCart, updateQuantity } = useCart();

  const addToCart = async (item: any, quantity: number = 1) => {
    try {
      setIsLoading(true);
      
      // Add the item to the cart using the context function
      await addToCartContext({
        ...item,
        quantity
      });
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    isLoading
  };
};
