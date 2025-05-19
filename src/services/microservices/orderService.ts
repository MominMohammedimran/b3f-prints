
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/lib/types";

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const order = {
    id: orderData.id,
    user_id: orderData.user_id,
    order_number: orderData.order_number,
    status: orderData.status,
    total: orderData.total,
    items: orderData.items,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    shipping_address: orderData.shipping_address || orderData.shippingAddress,
    payment_method: orderData.payment_method || orderData.paymentMethod || 'razorpay',
    delivery_fee: orderData.delivery_fee || orderData.deliveryFee || 0,
    user_email: orderData.user_email || '',
  };

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      throw error;
    }

    return data as Order;
  } catch (error) {
    console.error("Error retrieving order:", error);
    throw error;
  }
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Order[];
  } catch (error) {
    console.error("Error retrieving orders by user ID:", error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, updateData: Partial<Order>): Promise<Order> => {
  // Normalize shipping_address field if shippingAddress is provided
  if (updateData.shippingAddress && !updateData.shipping_address) {
    updateData.shipping_address = updateData.shippingAddress;
  }
  
  // Format order number
  if (updateData.orderNumber && !updateData.order_number) {
    updateData.order_number = updateData.orderNumber;
  }

  // Always update the updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Order;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string, reason?: string): Promise<Order> => {
  try {
    let updateData: Partial<Order> = { 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    };
    
    // Add cancellation reason if provided
    if (reason) {
      updateData.cancellation_reason = reason;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Order;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Order[];
  } catch (error) {
    console.error("Error retrieving all orders:", error);
    throw error;
  }
};
