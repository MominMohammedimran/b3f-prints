
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Update product inventory in the database
 * @param productType The product type (tshirt, mug, cap)
 * @param size The product size
 * @param quantity The new quantity to set
 * @returns Promise resolving to boolean indicating success
 */
export const updateProductInventory = async (
  productType: string, 
  size: string,
  quantity: number
): Promise<boolean> => {
  try {
    // Since we don't have a product_inventory table yet,
    // we'll use the products table with category='inventory'
    const { data, error } = await supabase
      .from('products')
      .update({ stock: quantity })
      .eq('category', 'inventory')
      .eq('name', `${productType}_${size}`);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating product inventory:', error);
    toast({
      title: 'Inventory update failed',
      description: 'Could not update product inventory',
      variant: 'destructive'
    });
    return false;
  }
};

/**
 * Get the current product inventory
 * @returns Promise with inventory data
 */
export const getProductInventory = async () => {
  try {
    // Since we don't have a product_inventory table yet,
    // we'll use the products table with category='inventory'
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'inventory');
    
    if (error) throw error;
    
    // Format the inventory data
    const inventory: Record<string, Record<string, number>> = {
      tshirt: { S: 0, M: 0, L: 0, XL: 0 },
      mug: { Standard: 0 },
      cap: { Standard: 0 }
    };
    
    if (data) {
      data.forEach((item: any) => {
        const [productType, size] = item.name.split('_');
        if (
          productType && 
          inventory[productType] && 
          size
        ) {
          inventory[productType][size] = item.stock || 0;
        }
      });
    }
    
    return inventory;
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    toast({
      title: 'Inventory fetch failed',
      description: 'Could not retrieve product inventory',
      variant: 'destructive'
    });
    
    // Return default inventory in case of error
    return {
      tshirt: { S: 10, M: 15, L: 8, XL: 5 },
      mug: { Standard: 20 },
      cap: { Standard: 12 }
    };
  }
};
