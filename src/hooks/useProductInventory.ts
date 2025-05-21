
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for better type safety
interface InventoryItem {
  size: string;
  quantity: number;
}

interface ProductInventory {
  [productType: string]: {
    [size: string]: number;
  };
}

export const useProductInventory = () => {
  const [sizeInventory, setSizeInventory] = useState<ProductInventory>({});
  const [loading, setLoading] = useState(false);

  const fetchProductInventory = useCallback(async () => {
    try {
      setLoading(true);
      // Get inventory data from the database for all products
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, stock')
        .in('category', ['tshirt', 'mug', 'cap']);
      
      if (error) {
        throw error;
      }
      
      // Format the inventory data
      const inventoryData: ProductInventory = {
        tshirt: { S: 10, M: 15, L: 8, XL: 5 },
        mug: { Standard: 20 },
        cap: { Standard: 12 }
      };
      
      if (data) {
        // Group products by category and merge stock data
        data.forEach(product => {
          const productType = product.category?.toLowerCase() || '';
          if (productType && ['tshirt', 'mug', 'cap'].includes(productType)) {
            // Ensure the category exists in our inventory object
            if (!inventoryData[productType]) {
              inventoryData[productType] = {};
            }
            
            // Determine sizes based on product type
            const sizes = productType === 'tshirt' 
              ? ['S', 'M', 'L', 'XL'] 
              : ['Standard'];
            
            // Set stock values from database if available
            if (typeof product.stock === 'number') {
              // If only a generic stock value, distribute across sizes
              const stockPerSize = Math.floor(product.stock / sizes.length);
              sizes.forEach(size => {
                if (!(size in inventoryData[productType])) {
                  inventoryData[productType][size] = stockPerSize;
                }
              });
            }
          }
        });
      }
      
      setSizeInventory(inventoryData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      // Fallback to default data
      setSizeInventory({
        tshirt: { S: 10, M: 15, L: 8, XL: 5 },
        mug: { Standard: 20 },
        cap: { Standard: 12 }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Use this for initial load
  useEffect(() => {
    fetchProductInventory();
  }, [fetchProductInventory]);

  const updateInventory = async (productType: string, size: string, change: number): Promise<boolean> => {
    try {
      // Calculate the new quantity
      const currentQuantity = sizeInventory[productType]?.[size] || 0;
      const newQuantity = Math.max(0, currentQuantity + change); // Ensure non-negative
      
      // Get products of this type
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock')
        .eq('category', productType);
        
      if (productsError) {
        throw productsError;
      }
      
      // Update all products of this type
      if (products && products.length > 0) {
        for (const product of products) {
          // Update stock value based on size change
          const currentStock = product.stock || 0;
          const stockChange = productType === 'tshirt' ? change : change * 4; // Adjust change based on product type
          const newStock = Math.max(0, currentStock + stockChange);
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
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
          ...prev[productType],
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
