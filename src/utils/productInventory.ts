
import { supabase } from '@/integrations/supabase/client';

// Fetch product inventory
export const getProductInventory = async () => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('settings')
      .eq('type', 'inventory')
      .single();
    
    if (error) {
      console.error('Error fetching inventory settings:', error);
      return {
        tshirt: { S: 10, M: 10, L: 10, XL: 10 },
        mug: { Standard: 10 },
        cap: { Standard: 10 }
      };
    }
    
    // Cast settings.settings to the correct type and access inventory property
    return (settings?.settings as any)?.inventory || {
      tshirt: { S: 10, M: 10, L: 10, XL: 10 },
      mug: { Standard: 10 },
      cap: { Standard: 10 }
    };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return {
      tshirt: { S: 10, M: 10, L: 10, XL: 10 },
      mug: { Standard: 10 },
      cap: { Standard: 10 }
    };
  }
};

// Update product inventory
export const updateProductInventory = async (
  productType: string,
  size: string,
  quantity: number
) => {
  try {
    // Get current inventory
    const currentInventory = await getProductInventory();
    
    // Update quantity
    if (currentInventory[productType] && 
        currentInventory[productType][size] !== undefined) {
      currentInventory[productType][size] -= quantity;
      
      // Make sure it doesn't go below 0
      if (currentInventory[productType][size] < 0) {
        currentInventory[productType][size] = 0;
      }
      
      // Save updated inventory
      const { error } = await supabase
        .from('settings')
        .update({ 
          settings: { 
            inventory: currentInventory 
          } 
        })
        .eq('type', 'inventory');
      
      if (error) {
        console.error('Error updating inventory:', error);
        throw error;
      }
      
      return true;
    } else {
      console.error('Product type or size not found in inventory');
      return false;
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Update inventory when order is delivered
export const updateInventoryForDeliveredOrder = async (orderId: string) => {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      console.error('Error fetching order:', orderError);
      return false;
    }
    
    // Only update inventory if order is delivered/completed
    if (['delivered', 'completed'].includes(order?.status?.toLowerCase())) {
      // Get order items
      const items = order.items;
      
      if (Array.isArray(items)) {
        // Process each item
        for (const item of items) {
          // Cast item to the appropriate type before accessing properties
          const typedItem = item as { productType?: string; size?: string; quantity?: number };
          
          if (typedItem.productType && typedItem.size && typedItem.quantity) {
            await updateProductInventory(
              typedItem.productType,
              typedItem.size,
              typedItem.quantity
            );
          }
        }
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating inventory for delivered order:', error);
    return false;
  }
};
