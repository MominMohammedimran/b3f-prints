
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { makePayment } from './razorpayService';

class PaymentService {
  db: any;

  constructor(db: any) {
    this.db = db;
  }

  async processPayment(
    userId: string,
    userEmail: string,
    orderNumber: string,
    total: number,
    deliveryFee: number,
    items: any[],
    shippingAddress: any,
    estimatedDelivery: string,
    paymentMethod: string,
    paymentDetails?: any
  ) {
    try {
      console.log('Processing payment with:', { userId, orderNumber, total, paymentMethod });
      
      // Format items for database storage
      const formattedItems = items.map(item => ({
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
        productId: item.productId
      }));

      // Create or update order in database
      // Only include fields that exist in the database schema
      const { data: orderData, error: orderError } = await this.db
        .from('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          total: total,
          delivery_fee: deliveryFee,
          items: formattedItems,
          status: paymentMethod === 'cod' ? 'processing' : 'payment_pending',
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return { success: false, error: 'Failed to create order record' };
      }

      return {
        success: true,
        orderId: orderData.id,
        orderNumber: orderData.order_number
      };
    } catch (error: any) {
      console.error('Payment service error:', error);
      return { success: false, error: error.message || 'Payment processing failed' };
    }
  }
}

export default PaymentService;
