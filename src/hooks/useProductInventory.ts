
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useProductInventory = () => {
  const [sizeInventory, setSizeInventory] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  const fetchProductInventory = useCallback(async () => {
    try {
      setLoading(true);
      // Get inventory data from the database for all products
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, stock');
      
      if (error) {
        throw error;
      }
      
      // Format the inventory data
      const inventoryData: Record<string, Record<string, number>> = {
        tshirt: { S: 10, M: 15, L: 8, XL: 5 },
        mug: { Standard: 20 },
        cap: { Standard: 12 }
      };
      
      // Update with actual stock data if available
      data?.forEach(product => {
        // Determine product type from category or name
        let productType = 'unknown';
        if (product.category?.toLowerCase().includes('tshirt')) {
          productType = 'tshirt';
        } else if (product.category?.toLowerCase().includes('mug')) {
          productType = 'mug';
        } else if (product.category?.toLowerCase().includes('cap')) {
          productType = 'cap';
        } else if (product.name?.toLowerCase().includes('tshirt')) {
          productType = 'tshirt';
        } else if (product.name?.toLowerCase().includes('mug')) {
          productType = 'mug';
        } else if (product.name?.toLowerCase().includes('cap')) {
          productType = 'cap';
        }

        // Update stock for the first size
        if (productType !== 'unknown') {
          const firstSize = Object.keys(inventoryData[productType])[0];
          if (firstSize && product.stock !== undefined) {
            inventoryData[productType][firstSize] = product.stock;
          }
        }
      });
      
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

  const updateInventory = async (productType: string, size: string, change: number) => {
    try {
      // Calculate the new quantity
      const currentQuantity = sizeInventory[productType]?.[size] || 0;
      const newQuantity = Math.max(0, currentQuantity + change); // Ensure non-negative
      
      // Get products of this type (using category as a proxy for product_type)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock')
        .ilike('category', `%${productType}%`);
        
      if (productsError) {
        throw productsError;
      }
      
      // Update all products of this type
      if (products && products.length > 0) {
        for (const product of products) {
          // Update the stock field for compatibility
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              stock: newQuantity,
              updated_at: new Date().toISOString() 
            })
            .eq('id', product.id);
            
          if (updateError) {
            console.error(`Error updating inventory for product ${product.id}:`, updateError);
          }
        }
      } else {
        console.warn(`No products found for type: ${productType}`);
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
