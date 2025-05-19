
import { useSupabaseClient } from './useSupabase';
import { TrackingInfo } from '../lib/types';
import { useQuery } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';

export const useOrderTracking = (orderId: string | undefined) => {
  const supabase = useSupabaseClient() as SupabaseClient;

  const fetchTracking = async (): Promise<TrackingInfo> => {
    if (!orderId) throw new Error('Order ID is missing');

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw new Error('Failed to fetch order information');
      }

      // Create tracking info from order data
      const today = new Date();
      const createdAt = new Date(orderData.created_at);
      const updatedAt = new Date(orderData.updated_at || today);
      const orderStatus = orderData.status?.toLowerCase() || 'processing';

      const history = [];
      
      // Always add processing status
      history.push({
        status: 'processing',
        timestamp: createdAt.toISOString(),
        location: 'B3F Prints and Mens Wear Shop',
        description: 'Order is being processed'
      });

      if (['shipped', 'out_for_delivery', 'delivered', 'completed'].includes(orderStatus)) {
        history.push({
          status: 'shipped',
          timestamp: new Date(updatedAt.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Distribution Center',
          description: 'Order has been shipped'
        });
      }

      if (['out_for_delivery', 'delivered', 'completed'].includes(orderStatus)) {
        history.push({
          status: 'out_for_delivery',
          timestamp: new Date(updatedAt.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Local Delivery Hub',
          description: 'Order is out for delivery'
        });
      }

      if (['delivered', 'completed'].includes(orderStatus)) {
        history.push({
          status: 'delivered',
          timestamp: updatedAt.toISOString(),
          location: 'Delivery Address',
          description: 'Order has been delivered'
        });
      }

      // Create tracking info from order data
      const trackingInfo: TrackingInfo = {
        id: orderId,
        order_id: orderId,
        status: orderStatus,
        timestamp: updatedAt.toISOString(),
        location: getLocationFromStatus(orderStatus),
        currentLocation: getLocationFromStatus(orderStatus),
        estimatedDelivery: getEstimatedDelivery(orderData.created_at, orderStatus),
        date: createdAt.toLocaleDateString(),
        time: createdAt.toLocaleTimeString(),
        history,
        orderNumber: orderData.order_number,
        items: orderData.items,
        total: orderData.total,
        shippingAddress: orderData.shipping_address
      };

      return trackingInfo;
    } catch (error) {
      console.error('Error fetching tracking:', error);
      throw new Error('Failed to fetch tracking information');
    }
  };

  const getLocationFromStatus = (status: string): string => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'Delivered to your address';
      case 'out_for_delivery':
        return 'Out for delivery';
      case 'shipped':
        return 'In transit';
      default:
        return 'Processing at warehouse';
    }
  };

  const getEstimatedDelivery = (createdAt: string, status: string): string => {
    const orderDate = new Date(createdAt);
    
    if (['delivered', 'completed'].includes(status)) {
      return 'Delivered';
    }
    
    // Add 5-7 days to order date for estimated delivery
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 5);
    
    return estimatedDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const {
    data: tracking,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tracking', orderId],
    queryFn: fetchTracking,
    enabled: !!orderId,
    staleTime: 60000,
    retry: 1
  });

  return { tracking, loading: isLoading, error };
};
