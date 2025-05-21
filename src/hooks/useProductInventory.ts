
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
        .select('id, name, product_type, inventory');
      
      if (error) {
        throw error;
      }
      
      // Format the inventory data
      const inventoryData: Record<string, Record<string, number>> = {};
      data?.forEach(product => {
        const productType = product.product_type || '';
        if (!product.inventory) {
          // Default inventory if none exists
          switch (productType.toLowerCase()) {
            case 'tshirt':
              inventoryData[productType] = { S: 10, M: 15, L: 8, XL: 5 };
              break;
            case 'mug':
              inventoryData[productType] = { Standard: 20 };
              break;
            case 'cap':
              inventoryData[productType] = { Standard: 12 };
              break;
            default:
              inventoryData[productType] = { Standard: 10 };
          }
        } else {
          inventoryData[productType] = product.inventory;
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
      
      // Get products of this type
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, inventory')
        .eq('product_type', productType);
        
      if (productsError) {
        throw productsError;
      }
      
      // Update all products of this type
      if (products && products.length > 0) {
        for (const product of products) {
          const currentInventory = product.inventory || {};
          const updatedInventory = { ...currentInventory, [size]: newQuantity };
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ inventory: updatedInventory })
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
