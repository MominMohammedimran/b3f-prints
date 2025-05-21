
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { serializeCartItems } from '@/utils/orderUtils';

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CartItem {
  id?: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
}

/**
 * Service for handling payment-related operations
 */
export class PaymentService {
  private supabase: SupabaseClient | null = null;
  
  constructor(supabaseClient: SupabaseClient | null) {
    this.supabase = supabaseClient;
  }
  
  /**
   * Create a new order in the database
   */
  async createOrder(
    userId: string,
    userEmail: string,
    orderNumber: string,
    totalAmount: number,
    deliveryFee: number,
    cartItems: CartItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: string = 'razorpay'
  ) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Serialize the cart items for storage
      const serializedItems = serializeCartItems(cartItems);
      
      // Create the basic payment details object
      const paymentDetails = {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'processing',
        timestamp: new Date().toISOString()
      };
      
      // Create the order in the database
      const { data, error } = await this.supabase
        .from('orders')
        .insert({
          user_id: userId,
          user_email: userEmail,
          order_number: orderNumber,
          total: totalAmount,
          status: 'order_placed',
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          delivery_fee: deliveryFee,
          items: serializedItems,
          payment_details: paymentDetails,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
  
  /**
   * Create order tracking information
   */
  async createOrderTracking(
    orderId: string,
    estimatedDeliveryDate: string
  ) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await this.supabase
        .from('order_tracking')
        .insert({
          order_id: orderId,
          status: 'pending',
          current_location: 'Warehouse',
          estimated_delivery: estimatedDeliveryDate,
          history: [
            {
              status: 'order_placed',
              date: new Date().toISOString(),
              location: 'Online',
              description: 'Order has been placed successfully'
            }
          ]
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order tracking:', error);
      throw error;
    }
  }
  
  /**
   * Process a complete payment
   */
  async processPayment(
    userId: string,
    userEmail: string,
    orderNumber: string,
    totalAmount: number,
    deliveryFee: number,
    cartItems: CartItem[],
    shippingAddress: ShippingAddress,
    estimatedDeliveryDate: string,
    paymentMethod: string = 'razorpay',
    paymentDetails: any = {}
  ) {
    try {
      // Create order with basic payment details
      const orderData = await this.createOrder(
        userId,
        userEmail,
        orderNumber,
        totalAmount,
        deliveryFee,
        cartItems,
        shippingAddress,
        paymentMethod
      );
      
      if (!orderData) {
        throw new Error('Failed to create order');
      }
      
      // If we have additional payment details (like from Razorpay), update them
      if (Object.keys(paymentDetails).length > 0 && paymentMethod === 'razorpay') {
        await this.updatePaymentDetails(orderData.id, paymentDetails);
      }
      
      // Try to create order tracking
      try {
        await this.createOrderTracking(orderData.id, estimatedDeliveryDate);
      } catch (trackingError) {
        console.error('Warning: Could not create tracking info:', trackingError);
        // Continue even if tracking creation fails
      }
      
      return {
        success: true,
        orderId: orderData.id,
        orderNumber: orderNumber
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error('Payment processing failed. Please try again.');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Update payment details for an existing order
   */
  async updatePaymentDetails(
    orderId: string,
    paymentDetails: any
  ) {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Create the payment details object including timestamps
      const updatedDetails = {
        ...paymentDetails,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await this.supabase
        .from('orders')
        .update({
          payment_details: updatedDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment details:', error);
      throw error;
    }
  }
  
  /**
   * Save shipping address for a user
   */
  async saveUserAddress(
    userId: string, 
    addressData: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone?: string;
    }
  ) {
    try {
      if (!this.supabase) return null;
      
      // Check if address exists
      const { data: existingAddress } = await this.supabase
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();
      
      const addressName = `${addressData.firstName} ${addressData.lastName}`;
      
      if (existingAddress) {
        // Update existing address
        const { data, error } = await this.supabase
          .from('addresses')
          .update({
            name: addressName,
            street: addressData.address,
            city: addressData.city,
            state: addressData.state,
            zipcode: addressData.zipCode,
            country: addressData.country,
            phone: addressData.phone || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAddress.id)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        // Create new address
        const { data, error } = await this.supabase
          .from('addresses')
          .insert({
            user_id: userId,
            name: addressName,
            street: addressData.address,
            city: addressData.city,
            state: addressData.state,
            zipcode: addressData.zipCode,
            country: addressData.country,
            phone: addressData.phone || '',
            is_default: true
          })
          .select();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }
}

export default PaymentService;
