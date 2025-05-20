
import { useSupabaseClient } from './useSupabase';
import { TrackingInfo } from '../lib/types';
import { useQuery } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';

const generateMockTrackingData = (orderId: string): TrackingInfo => {
  const statuses = ['processing', 'shipped', 'out_for_delivery', 'delivered'];
  const randomIndex = Math.floor(Math.random() * 3); // 0, 1, or 2
  const currentStatus = statuses[randomIndex];
  const today = new Date();

  const history = [];

  // Always add processing status
  history.push({
    status: 'processing',
    timestamp: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'B3F Prints and Mens Wear Shop',
    description: 'Order is being processed'
  });

  if (randomIndex >= 1) {
    // Add shipped status
    history.push({
      status: 'shipped',
      timestamp: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Gooty, B3F Prints and Mens Wear',
      description: 'Order has been shipped'
    });
  }

  if (randomIndex >= 2) {
    // Add out_for_delivery status
    history.push({
      status: 'out_for_delivery',
      timestamp: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Local Delivery Hub',
      description: 'Order is out for delivery'
    });
  }

  if (randomIndex === 3) {
    // Add delivered status
    history.push({
      status: 'delivered',
      timestamp: today.toISOString(),
      location: 'Delivery Address',
      description: 'Order has been delivered'
    });
  }

  return {
    id: `tracking-${orderId}`,
    order_id: orderId,
    status: currentStatus,
    location: currentStatus === 'delivered' ? 'Delivered' : 'On the way',
    timestamp: today.toISOString(),
    currentLocation: currentStatus === 'delivered' ? 'Delivered' : 'On the way',
    estimatedDelivery: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    date: today.toLocaleDateString(),
    time: today.toLocaleTimeString(),
    history
  };
};

export const useOrderTracking = (orderId: string | undefined) => {
  const supabase = useSupabaseClient() as SupabaseClient;

  const fetchTracking = async (): Promise<TrackingInfo> => {
    if (!orderId) throw new Error('Order ID is missing');

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('status, created_at, updated_at')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) {
        console.error('Order status fetch error:', orderError);
        return generateMockTrackingData(orderId);
      }

      const { data: trackingData, error: trackingError } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (trackingError) {
        console.error('Tracking fetch error:', trackingError);
      }

      if (trackingData) {
        // Parse history if it's stored as a string
        let history = trackingData.history;
        if (typeof history === 'string') {
          try {
            history = JSON.parse(history);
          } catch (e) {
            history = [];
          }
        }

        return {
          ...trackingData,
          history: Array.isArray(history) ? history : []
        } as TrackingInfo;
      }

      if (orderData) {
        // We have order data but no tracking data, generate tracking info from order status
        const today = new Date();
        const createdAt = new Date(orderData.created_at);
        const updatedAt = new Date(orderData.updated_at || today);

        const history = [];
        const orderStatus = orderData.status?.toLowerCase() || 'processing';

        // Always add processing status
        history.push({
          status: 'processing',
          timestamp: createdAt.toISOString(),
          location: 'B3F Prints and Mens Wear Shop',
          description: 'Order is being processed'
        });

        if (['shipped', 'out_for_delivery', 'delivered'].includes(orderStatus)) {
          history.push({
            status: 'shipped',
            timestamp: new Date(updatedAt.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Distribution Center',
            description: 'Order has been shipped'
          });
        }

        if (['out_for_delivery', 'delivered'].includes(orderStatus)) {
          history.push({
            status: 'out_for_delivery',
            timestamp: new Date(updatedAt.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Local Delivery Hub',
            description: 'Order is out for delivery'
          });
        }

        if (orderStatus === 'delivered') {
          history.push({
            status: 'delivered',
            timestamp: updatedAt.toISOString(),
            location: 'Delivery Address',
            description: 'Order has been delivered'
          });
        }

        // Create tracking info from order data
        const trackingInfo: TrackingInfo = {
          id: `tracking-${orderId}`,
          order_id: orderId,
          status: orderStatus,
          timestamp: updatedAt.toISOString(),
          location: orderStatus === 'delivered' ? 'Delivered' : 
                   orderStatus === 'shipped' || orderStatus === 'out_for_delivery' ? 'Out for delivery' : 
                   'Processing Center',
          currentLocation: orderStatus === 'delivered' ? 'Delivered' : 
                          orderStatus === 'shipped' || orderStatus === 'out_for_delivery' ? 'Out for delivery' : 
                          'Processing Center',
          estimatedDelivery: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          date: createdAt.toLocaleDateString(),
          time: createdAt.toLocaleTimeString(),
          history
        };

        return trackingInfo;
      }

      // If no order or tracking data, create mock data
      console.warn('No tracking data found. Returning mock data.');
      return generateMockTrackingData(orderId);
    } catch (error) {
      console.error('Error fetching tracking:', error);
      return generateMockTrackingData(orderId);
    }
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
