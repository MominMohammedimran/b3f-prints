
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useProductInventory = () => {
  const [sizeInventory, setSizeInventory] = useState<Record<string, Record<string, number>>>({
    tshirt: { S: 10, M: 15, L: 8, XL: 5 },
    mug: { Standard: 20 },
    cap: { Standard: 12 }
  });
  const [loading, setLoading] = useState(false);

  const fetchProductInventory = useCallback(async () => {
    try {
      setLoading(true);
      // Get inventory data from the database for all products
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, inventory');
      
      if (error) {
        throw error;
      }
      
      // Format the inventory data
      const inventoryData: Record<string, Record<string, number>> = {
        tshirt: { S: 10, M: 15, L: 8, XL: 5 },
        mug: { Standard: 20 },
        cap: { Standard: 12 }
      };
      
      // Only process data if it exists
      if (data && Array.isArray(data)) {
        data.forEach(product => {
          // Safely access properties with type checks and null checks
          if (!product) return;
          
          // Determine product type from category or name
          let productType = '';
          if (typeof product === 'object') {
            if ('name' in product && product.name && typeof product.name === 'string') {
              const name = product.name.toLowerCase();
              if (name.includes('tshirt') || name.includes('t-shirt')) {
                productType = 'tshirt';
              } else if (name.includes('mug')) {
                productType = 'mug';
              } else if (name.includes('cap')) {
                productType = 'cap';
              }
            }
            
            // If category is available, use it instead
            if ('category' in product && product.category && typeof product.category === 'string') {
              const category = product.category.toLowerCase();
              if (category.includes('tshirt') || category.includes('t-shirt')) {
                productType = 'tshirt';
              } else if (category.includes('mug')) {
                productType = 'mug';
              } else if (category.includes('cap')) {
                productType = 'cap';
              }
            }
            
            // If we have a product type and inventory data, store it
            if (productType && 'inventory' in product && product.inventory && typeof product.inventory === 'object') {
              inventoryData[productType] = product.inventory as Record<string, number>;
            }
          }
        });
      }
      
      setSizeInventory(inventoryData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      // Using default data which was set in the initial state
    } finally {
      setLoading(false);
    }
  }, []);

  // Use this for initial load
  useEffect(() => {
    fetchProductInventory();
  }, [fetchProductInventory]);

  const updateInventory = async (productType: string, size: string, change: number) => {
    try {
      // Calculate the new quantity
      const currentQuantity = sizeInventory[productType]?.[size] || 0;
      const newQuantity = Math.max(0, currentQuantity + change); // Ensure non-negative
      
      // Get products of this type - using category field which exists in the schema
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, inventory')
        .ilike('category', `%${productType}%`);
        
      if (productsError) {
        throw productsError;
      }
      
      // Update all products of this type
      if (products && products.length > 0) {
        for (const product of products) {
          // Skip products without id or that aren't valid objects
          if (!product || typeof product !== 'object' || !('id' in product) || !product.id) continue;
          
          // Get current inventory or initialize empty object
          const currentInventory = ('inventory' in product && product.inventory) 
            ? (product.inventory as Record<string, number>) 
            : {};
            
          const updatedInventory = { ...currentInventory, [size]: newQuantity };
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              inventory: updatedInventory,
              updated_at: new Date().toISOString()
            })
            .eq('id', product.id);
            
          if (updateError) {
            console.error(`Error updating inventory for product ${product.id}:`, updateError);
          }
        }
      }
      
      // Update local state
      setSizeInventory(prev => ({
        ...prev,
        [productType]: {
          ...(prev[productType] || {}),
          [size]: newQuantity
        }
      }));
      
      return true;
    } catch (err) {
      console.error('Error updating inventory:', err);
      toast.error('Failed to update inventory');
      return false;
    }
  };

  return {
    sizeInventory,
    loading,
    fetchProductInventory,
    updateInventory
  };
};

export default useProductInventory;
