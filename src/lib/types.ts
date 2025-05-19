
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
  images?: string[];
  rating?: number;
  category?: string;
  tags?: string[];
  stock?: number;
  productId?: string;
  sizes?: string[];
  additionalImages?: string[];
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
  orderNumber?: string; // For compatibility with existing code
  paymentMethod?: string; // For compatibility with existing code
  delivery_fee?: number;
  shipping_address?: any;
  date?: string; // For compatibility with existing code
}

export interface TrackingInfo {
  id: string;
  order_id: string;
  orderId?: string; // For backward compatibility
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
  phone?: string; // For compatibility
  created_at?: string;
  updated_at?: string;
  reward_points?: number;
  auth_user?: any; // For compatibility
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

// Additional types needed by components
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  username: string;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
}
