
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getProductInventory, updateProductInventory } from '@/utils/productInventory';

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
      const inventoryData = await getProductInventory();
      
      if (inventoryData) {
        setSizeInventory(inventoryData);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      toast.error('Failed to load product availability data');
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
      
      // In a real app, this would update the Supabase database
      const success = await updateProductInventory(productType, size, newQuantity);
      
      if (success) {
        // Update local state
        setSizeInventory(prev => ({
          ...prev,
          [productType]: {
            ...prev[productType],
            [size]: newQuantity
          }
        }));
      }
      
      return success;
    } catch (err) {
      console.error('Error updating inventory:', err);
      toast.error('Failed to update inventory', {
        description: 'Could not update product quantity',
      });
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
