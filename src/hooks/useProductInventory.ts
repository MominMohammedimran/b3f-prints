
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
        .select('id, name, category, stock');
      
      if (error) {
        throw error;
      }
      
      // Format the inventory data with default values
      const inventoryData: Record<string, Record<string, number>> = {
        tshirt: { S: 10, M: 15, L: 8, XL: 5 },
        mug: { Standard: 20 },
        cap: { Standard: 12 }
      };
      
      // Update with actual stock data if available
      if (data && Array.isArray(data)) {
        data.forEach(product => {
          if (!product) return;
          
          // Determine product type from category or name
          let productType = 'unknown';
          const category = product.category?.toLowerCase() || '';
          const name = product.name?.toLowerCase() || '';
          
          if (category.includes('tshirt') || name.includes('tshirt')) {
            productType = 'tshirt';
          } else if (category.includes('mug') || name.includes('mug')) {
            productType = 'mug';
          } else if (category.includes('cap') || name.includes('cap')) {
            productType = 'cap';
          }

          // Update stock for the first size if we have a valid product type
          if (productType !== 'unknown' && inventoryData[productType]) {
            const firstSize = Object.keys(inventoryData[productType])[0];
            if (firstSize && typeof product.stock === 'number') {
              inventoryData[productType][firstSize] = product.stock;
            }
          }
        });
      }
      
      setSizeInventory(inventoryData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      // Fallback to default data (already set in initial state)
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
      // Safety check for undefined values
      if (!productType || !size || !sizeInventory[productType]) {
        console.warn('Invalid product type or size provided:', { productType, size });
        return false;
      }
      
      // Calculate the new quantity
      const currentQuantity = sizeInventory[productType][size] || 0;
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
          if (!product || !product.id) continue;
          
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
