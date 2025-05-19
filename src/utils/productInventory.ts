
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
    
    return settings?.settings?.inventory || {
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
          if (item.productType && item.size && item.quantity) {
            await updateProductInventory(
              item.productType,
              item.size,
              item.quantity
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
