// If this file exists, add these types to it. 
// If not, create the file with these types.

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  rating?: number;
  category?: string;
  tags?: string[];
  stock?: number;
  productId?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  productType?: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total: number;
  items: CartItem[];
  created_at: string;
  updated_at: string;
  payment_method: string;
  delivery_fee?: number;
  shipping_address?: any;
}

export interface TrackingInfo {
  id: string;
  order_id: string;
  status: string;
  timestamp: string;
  location: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  date?: string;
  time?: string;
  history?: TrackingHistoryItem[];
  orderNumber?: string;
  items?: CartItem[];
  total?: number;
  shippingAddress?: any;
}

export interface TrackingHistoryItem {
  status: string;
  timestamp: string;
  location: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface PaymentDetails {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
}

export interface ProductInventoryItem {
  productType: string;
  size: string;
  quantity: number;
}
