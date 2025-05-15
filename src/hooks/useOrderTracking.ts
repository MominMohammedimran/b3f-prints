
import { useSupabaseClient } from './useSupabase';
import { TrackingInfo } from '../lib/types';
import { useQuery } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';

const generateMockTrackingData = (orderId: string): TrackingInfo => {
  const statuses = ['processing', 'shipped', 'delivered'];
  const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const today = new Date();

  const history = [];

  if (currentStatus === 'processing') {
    history.push({
      status: 'processing',
      timestamp: new Date(today.setDate(today.getDate() - 2)).toISOString(),
      location: 'B3F Prints and Mens Wear Shop',
      description: 'Order is being processed'
    });
  }

  if (currentStatus === 'shipped' || currentStatus === 'delivered') {
    history.push({
      status: 'shipped',
      timestamp: new Date(today.setDate(today.getDate() - 1)).toISOString(),
      location: 'Gooty , B3F Prints and Mens Wear',
      description: 'Order has been shipped'
    });
    history.push({
      status: 'out_for_delivery',
      timestamp: new Date().toISOString(),
      location: 'Local Delivery Hub',
      description: 'Order is out for delivery'
    });
  }

  if (currentStatus === 'delivered') {
    history.push({
      status: 'delivered',
      timestamp: new Date(today.setDate(today.getDate() + 1)).toISOString(),
      location: 'Delivery Address',
      description: 'Order has been delivered'
    });
  }

  return {
    id: `tracking-${Date.now()}`,
    order_id: orderId,
    status: currentStatus,
    location: currentStatus === 'delivered' ? 'Delivered' : 'On the way',
    timestamp: new Date().toISOString(),
    currentLocation: currentStatus === 'delivered' ? 'Delivered' : 'On the way',
    estimatedDelivery: new Date(today.setDate(today.getDate() + 3)).toLocaleDateString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
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

      if (orderError) console.error('Order status fetch error:', orderError);

      const { data: trackingData, error: trackingError } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (trackingError) console.error('Tracking fetch error:', trackingError);

      if (trackingData) return trackingData as TrackingInfo;

      if (orderData) {
        const today = new Date();
        const createdAt = new Date(orderData.created_at);
        const updatedAt = new Date(orderData.updated_at || today);

        const history = [];

        if (['processing', 'Processing'].includes(orderData.status)) {
          history.push({
            status: 'processing',
            timestamp: updatedAt.toISOString(),
            location: 'B3F Prints and Mens Wear Shop',
            description: 'Order is being processed'
          });
        }

        if (['shipped', 'Shipped'].includes(orderData.status)) {
          history.push({
            status: 'shipped',
            timestamp: updatedAt.toISOString(),
            location: 'Distribution Center',
            description: 'Order has been shipped'
          });
          history.push({
            status: 'out_for_delivery',
            timestamp: new Date(updatedAt.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            location: 'Local Delivery Hub',
            description: 'Order is out for delivery'
          });
        }

        if (['delivered', 'Delivered'].includes(orderData.status)) {
          history.push({
            status: 'shipped',
            timestamp: new Date(updatedAt.getTime() - 3 * 60 * 60 * 1000).toISOString(),
            location: 'Distribution Center',
            description: 'Order has been shipped'
          });
          history.push({
            status: 'out_for_delivery',
            timestamp: new Date(updatedAt.getTime() - 1 * 60 * 60 * 1000).toISOString(),
            location: 'Local Delivery Hub',
            description: 'Order is out for delivery'
          });
          history.push({
            status: 'delivered',
            timestamp: updatedAt.toISOString(),
            location: 'Delivery Address',
            description: 'Order has been delivered'
          });
        }

        return {
          id: `tracking-${Date.now()}`,
          order_id: orderId,
          status: orderData.status,
          timestamp: updatedAt.toISOString(),
          location: ['delivered', 'Delivered'].includes(orderData.status)
            ? 'Delivered'
            : ['shipped', 'Shipped'].includes(orderData.status)
              ? 'Out for delivery'
              : 'Processing Center',
          currentLocation: ['delivered', 'Delivered'].includes(orderData.status)
            ? 'Delivered'
            : ['shipped', 'Shipped'].includes(orderData.status)
              ? 'Out for delivery'
              : 'Processing Center',
          estimatedDelivery: new Date(today.setDate(today.getDate() + 5)).toLocaleDateString(),
          date: createdAt.toLocaleDateString(),
          time: createdAt.toLocaleTimeString(),
          history
        };
      }

      console.warn('No tracking data found. Returning mock.');
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
