
import { Order, CartItem, ShippingAddress } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a unique order ID
 * @returns string A unique order ID
 */
export const generateOrderId = (): string => {
  const timestamp = new Date().getTime().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `order-${timestamp}-${randomPart}`;
};

/**
 * Format order date to a readable format
 * @param dateString ISO date string
 * @returns formatted date string
 */
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculate the subtotal from order items
 * @param items array of cart items
 * @returns subtotal value
 */
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Format shipping address as a single string
 * @param address shipping address object
 * @returns formatted address string
 */
export const formatAddress = (address: ShippingAddress | undefined | null): string => {
  if (!address) return 'No shipping address';
  
  // Handle the case where address is stored as a JSON string
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch (e) {
      return 'Invalid address format';
    }
  }
  
  const parts = [
    address.name,
    address.street,
    address.city,
    address.state,
    address.zipcode || address.zipCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Check if an order can be cancelled
 * @param order the order object
 * @returns boolean indicating if order can be cancelled
 */
export const canCancelOrder = (order: Order): boolean => {
  const nonCancelableStatuses = ['delivered', 'shipped', 'cancelled'];
  return !nonCancelableStatuses.includes(order.status);
};

/**
 * Get appropriate message for order status
 * @param status order status
 * @returns message explaining the status
 */
export const getOrderStatusMessage = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'Your order is being processed.';
    case 'shipped':
      return 'Your order has been shipped.';
    case 'out_for_delivery':
    case 'out for delivery':
      return 'Your order is out for delivery.';
    case 'delivered':
      return 'Your order has been delivered.';
    case 'cancelled':
      return 'Your order has been cancelled.';
    case 'order_placed':
    case 'order placed':
      return 'Your order has been placed successfully.';
    default:
      return 'Order received.';
  }
};

/**
 * Create an order in the database
 * @param orderData Order data to save
 * @returns The created order or null if failed
 */
export const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
  try {
    // Make sure we have the required fields
    if (!orderData.user_id || !orderData.items || !orderData.total) {
      console.error('Missing required order fields');
      return null;
    }
    
    // Generate an order number if none provided
    const orderNumber = orderData.order_number || `ORD-${Date.now()}`;
    
    // Insert the order into the database
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        order_number: orderNumber,
        status: orderData.status || 'processing',
        payment_method: orderData.payment_method || 'razorpay',
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      return null;
    }
    
    return data as Order;
  } catch (error) {
    console.error('Failed to create order:', error);
    return null;
  }
};

/**
 * Update payment details for an order
 * @param orderId The ID of the order to update
 * @param paymentDetails Payment details to save
 * @returns boolean indicating success
 */
export const updateOrderPaymentDetails = async (
  orderId: string,
  paymentDetails: any
): Promise<boolean> => {
  try {
    // Update the order with payment details
    const { error } = await supabase
      .from('orders')
      .update({
        payment_details: paymentDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order payment details:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update order payment details:', error);
    return false;
  }
};
