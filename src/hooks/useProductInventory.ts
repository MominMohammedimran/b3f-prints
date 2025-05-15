
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getProductInventory, updateProductInventory } from '@/utils/productInventory';

export interface InventoryState {
  inventory: Record<string, Record<string, number>>;
  loading: boolean;
  error: Error | null;
  updateQuantity: (productType: string, size: string, quantity: number) => Promise<boolean>;
  refreshInventory: () => Promise<void>;
}

export const useProductInventory = (): InventoryState => {
  const [inventory, setInventory] = useState<Record<string, Record<string, number>>>({
    tshirt: { S: 0, M: 0, L: 0, XL: 0 },
    mug: { Standard: 0 },
    cap: { Standard: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductInventory();
      setInventory(data);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch inventory'));
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInventory();
  }, []);
  
  const updateQuantity = async (productType: string, size: string, quantity: number): Promise<boolean> => {
    try {
      const success = await updateProductInventory(productType, size, quantity);
      
      if (success) {
        // Update local state
        setInventory(prev => ({
          ...prev,
          [productType]: {
            ...prev[productType],
            [size]: quantity
          }
        }));
        return true;
      } else {
        throw new Error('Failed to update inventory');
      }
    } catch (err) {
      console.error('Error updating inventory:', err);
      toast.error('Failed to update inventory');
      return false;
    }
  };
  
  return {
    inventory,
    loading,
    error,
    updateQuantity,
    refreshInventory: fetchInventory
  };
};
