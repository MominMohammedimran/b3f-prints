import { Order, CartItem, ShippingAddress } from '@/lib/types';

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
    month: 'long', 
    day: 'numeric'
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
export const formatAddress = (address: ShippingAddress | undefined): string => {
  if (!address) return 'No shipping address';
  
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
    default:
      return 'Order received.';
  }
};

/**
 * Calculate order total including items and delivery fee
 */
export const calculateOrderTotal = (order: Order): number => {
  let itemsTotal = 0;
  
  if (order.items && Array.isArray(order.items)) {
    itemsTotal = order.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }
  
  const deliveryFee = order.delivery_fee || order.deliveryFee || 0;
  return itemsTotal + deliveryFee;
};

/**
 * Format the shipping address as a string
 */
export const formatShippingAddress = (address: ShippingAddress | null | undefined): string => {
  if (!address) return 'No address provided';
  
  // Handle both property naming conventions
  const fullName = address.fullName || address.name || '';
  const addressLine = address.addressLine1 || address.street || '';
  const city = address.city || '';
  const state = address.state || '';
  const postalCode = address.postalCode || address.zipCode || address.zipcode || '';
  const country = address.country || 'India';
  
  return `${fullName}\n${addressLine}\n${city}, ${state} ${postalCode}\n${country}`;
};
