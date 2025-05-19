
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { products } from '@/lib/data';
import CartItemList from '@/components/cart/CartItemList';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';

export interface CartItem {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  price: number;
  image?: string;
  color?: string;
  size?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!currentUser) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCartItems(data);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCartItems();
  }, [currentUser]);
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };
  
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('carts')
        .update({ quantity: newQuantity })
        .eq('id', itemId);
      
      if (error) throw error;
      
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };
  
  const handleCheckout = () => {
    if (!currentUser) {
      toast.error('Please sign in to checkout');
      navigate('/signin');
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2">Loading your cart...</p>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <CartItemList 
                cartItems={cartItems} 
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
              />
            </div>
            
            <div>
              <CartSummary 
                subtotal={calculateSubtotal()}
                deliveryFee={50}
                onCheckout={handleCheckout}
              />
              
              <Button
                onClick={handleCheckout}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <EmptyCart />
        )}
      </div>
    </Layout>
  );
};

export default Cart;
