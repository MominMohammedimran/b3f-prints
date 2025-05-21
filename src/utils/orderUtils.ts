
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
      return 'Your order has been placed successfully.';
    default:
      return 'Order received.';
  }
};

/**
 * Parse order items from various formats
 * @param items order items in various formats
 * @returns array of CartItem objects
 */
export const parseOrderItems = (items: any): CartItem[] => {
  if (!items) return [];
  
  // If items is a string, try to parse it as JSON
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (e) {
      console.error('Failed to parse order items string:', e);
      return [];
    }
  }
  
  // Ensure items is an array
  if (!Array.isArray(items)) {
    console.error('Order items is not an array:', items);
    return [];
  }
  
  // Convert each item to CartItem format
  return items.map(item => ({
    id: item.id || item.productId || `item-${Math.random().toString(36).substr(2, 9)}`,
    productId: item.productId || item.id || '',
    name: item.name || 'Product',
    price: item.price || 0,
    quantity: item.quantity || 1,
    image: item.image || '',
    size: item.size,
    color: item.color,
    options: item.options
  }));
};

/**
 * Format order data to consistent format
 * @param order The order object
 * @returns Standardized order object
 */
export const normalizeOrderData = (order: any): Order => {
  if (!order) return {} as Order;
  
  return {
    id: order.id || '',
    order_number: order.order_number || order.orderNumber || '',
    orderNumber: order.order_number || order.orderNumber || '',
    user_id: order.user_id || '',
    user_email: order.user_email || '',
    items: parseOrderItems(order.items),
    total: order.total || 0,
    status: order.status || 'processing',
    payment_method: order.payment_method || order.paymentMethod || 'cod',
    paymentMethod: order.payment_method || order.paymentMethod || 'cod',
    shipping_address: order.shipping_address || order.shippingAddress || {},
    shippingAddress: order.shipping_address || order.shippingAddress || {},
    delivery_fee: order.delivery_fee || order.deliveryFee || 0,
    deliveryFee: order.delivery_fee || order.deliveryFee || 0,
    created_at: order.created_at || order.date || new Date().toISOString(),
    updated_at: order.updated_at || new Date().toISOString(),
    date: order.date || order.created_at || new Date().toISOString(),
    cancellation_reason: order.cancellation_reason || ''
  };
};

/**
 * Calculate estimated delivery date (5 days from order date)
 * @param orderDate the date when order was placed
 * @returns estimated delivery date as string
 */
export const calculateEstimatedDelivery = (orderDate: string | Date): string => {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + 5);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Serialize cart items for storage
 * @param items cart items to serialize 
 * @returns serialized cart items ready for storage
 */
export const serializeCartItems = (items: CartItem[]): any[] => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    image: item.image,
    productId: item.productId,
    color: item.color
  }));
};
