
import { useState } from 'react';
import { toast } from 'sonner';
import { getProductInventory } from '@/utils/productInventory';

export const useProductInventory = () => {
  const [sizeInventory, setSizeInventory] = useState<Record<string, Record<string, number>>>({
    tshirt: { S: 10, M: 15, L: 8, XL: 5 },
    mug: { Standard: 20 },
    cap: { Standard: 12 }
  });

  const fetchProductInventory = async () => {
    try {
      // Fix: Use our utility function instead of direct Supabase call
      const inventoryData = await getProductInventory();
      
      if (inventoryData) {
        setSizeInventory(inventoryData);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      toast.error('Failed to load product availability data');
    }
  };

  const updateInventory = async (productType: string, size: string, change: number) => {
    try {
      // In a real app, this would update the Supabase database
      // Since we don't have the product_inventory table in Supabase yet, update local state
      setSizeInventory(prev => ({
        ...prev,
        [productType]: {
          ...prev[productType],
          [size]: prev[productType][size] + change
        }
      }));
      
      return true;
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
    fetchProductInventory,
    updateInventory
  };
};
