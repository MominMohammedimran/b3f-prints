import { useProductInventory } from './useProductInventory';
import { toast } from 'sonner';

interface SizeInventory {
  [productType: string]: {
    [size: string]: number;
  };
}

export const useDesignToolInventory = () => {
  const { inventory, loading, error, fetchInventory, updateInventory } = useProductInventory();
  
  // Default size inventory structure
  const sizeInventory: SizeInventory = {
    tshirt: { S: 10, M: 10, L: 10, XL: 10 },
    mug: { Standard: 10 },
    cap: { Standard: 10 }
  };
  
  // Map the inventoryData to sizeInventory format (for backwards compatibility)
  const fetchProductInventory = async () => {
    // Implementation remains empty as we're not using this directly
    // But keeping for interface compatibility
    await fetchInventory();
  };
  
  // Adapt the updateInventory function to match the old interface
  const adaptedUpdateInventory = async (
    productType: string, 
    size: string, 
    quantityChange: number
  ): Promise<boolean> => {
    try {
      // Create inventory update
      const currentQuantities = { ...sizeInventory[productType] };
      const newQuantity = (currentQuantities[size] || 0) + quantityChange;
      
      if (newQuantity < 0) {
        toast.error(`Cannot set negative inventory for ${productType} size ${size}`);
        return false;
      }
      
      // Update quantities
      currentQuantities[size] = newQuantity;
      
      // Save to product inventory
      await updateInventory({ 
        quantities: { 
          ...currentQuantities
        } 
      });
      
      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      return false;
    }
  };
  
  return {
    sizeInventory,
    fetchProductInventory,
    updateInventory: adaptedUpdateInventory
  };
};
