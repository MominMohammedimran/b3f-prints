
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { products } from '@/lib/data';  // Import mock products

// Define the shape of wishlist items
export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  originalPrice?: number;
  updated_at?: string;
}

// Define the shape of the context
interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

// Create the context with default values
const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  clearWishlist: async () => {},
  isInWishlist: () => false,
  loading: false,
});

// Custom hook to use the wishlist context
export const useWishlist = () => useContext(WishlistContext);

// Provider component
export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch wishlist items when user changes
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!currentUser) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('wishlists')
          .select('*')
          .eq('user_id', currentUser.id);

        if (error) throw error;

        // Process the wishlist data to get complete product information
        const enrichedItems = data.map(item => {
          // Find the product from mock data (in a real app, you'd fetch this from your API)
          const product = products.find(p => p.id === item.product_id);
          
          return {
            ...item,
            name: product?.name || 'Product',
            price: product?.price || 0,
            image: product?.image || '',
            category: product?.category || '',
            originalPrice: product?.originalPrice || undefined,
          };
        });

        setWishlistItems(enrichedItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, [currentUser]);

  // Add product to wishlist
  const addToWishlist = async (productId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to add items to your wishlist');
      return;
    }

    try {
      // Find the product from mock data
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        toast.error('Product not found');
        return;
      }

      // First check if the product is already in the wishlist
      const { data: existingItems } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItems) {
        toast.info('Item already in your wishlist');
        return;
      }
      
      // Add to Supabase
      const { data, error } = await supabase
        .from('wishlists')
        .insert([
          { 
            user_id: currentUser.id, 
            product_id: productId,
            name: product.name,
            price: product.price,
            image: product.image
          }
        ])
        .select();

      if (error) throw error;

      // Add the new item to the state
      if (data && data[0]) {
        setWishlistItems(prev => [...prev, {
          ...data[0],
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          originalPrice: product.originalPrice
        }]);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      toast.error(error.message || 'Failed to add to wishlist');
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId: string) => {
    if (!currentUser) return;

    try {
      // Find the wishlist item to delete
      const itemToDelete = wishlistItems.find(item => item.product_id === productId);
      if (!itemToDelete) return;

      // Remove from Supabase
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      // Update the state
      setWishlistItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast.error(error.message || 'Failed to remove from wishlist');
    }
  };

  // Clear the entire wishlist
  const clearWishlist = async () => {
    if (!currentUser || wishlistItems.length === 0) return;

    try {
      // Remove all items from Supabase
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Clear the state
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    } catch (error: any) {
      console.error('Error clearing wishlist:', error);
      toast.error(error.message || 'Failed to clear wishlist');
    }
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
