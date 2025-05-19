
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { Order } from '../lib/types';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatShippingAddress } from "@/utils/orderUtils";
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const OrderComplete = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isOrderFound, setIsOrderFound] = useState(false);
  
  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 // 1 minute
  });
  
  useEffect(() => {
    if (order) {
      setIsOrderFound(true);
    }
  }, [order]);
  
  // Show error message if not found
  if (error) {
    console.error("Error fetching order:", error);
    toast.error("Could not find your order details.");
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="text-green-500 mb-4">
            <CheckCircle size={64} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Order Placed Successfully!
          </h1>
          
          <p className="text-gray-600 mb-4 max-w-md">
            Your order has been confirmed and will be shipped soon. You will receive an email with your order details.
          </p>
          
          {isLoading ? (
            <div className="w-full mb-6">
              <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          ) : isOrderFound ? (
            <div className="font-medium text-gray-700 mb-6">
              <p>Order #{order?.order_number || order?.orderNumber}</p>
              <p className="text-sm text-gray-500">
                {new Date(order?.created_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          ) : (
            <div className="text-red-500 mb-6">Order details not found</div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/orders')}
              className="min-w-[150px]"
            >
              Track Order
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              className="min-w-[150px] bg-blue-600 hover:bg-blue-700"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
        
        {isOrderFound && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium capitalize">{order?.payment_method || order?.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Total</span>
                    <span className="font-medium">₹{order?.total - (order?.delivery_fee || order?.deliveryFee || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">₹{order?.delivery_fee || order?.deliveryFee || 0}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">₹{order?.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
                <p className="whitespace-pre-line text-gray-700">
                  {order?.shipping_address ? 
                    formatShippingAddress(order.shipping_address) : 
                    'No shipping address provided'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderComplete;
