export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  productId?: string;
  size?: string;
  view?: string;
  backImage?: string;
  color?: string;
  options?: Record<string, string>;
}

export interface Order {
  id: string;
  order_number?: string;
  orderNumber?: string;
  user_id: string;
  user_email?: string;
  items: CartItem[];
  total: number;
  status: string;
  payment_method?: string;
  paymentMethod?: string;
  shipping_address?: any;
  shippingAddress?: any;
  delivery_fee?: number;
  deliveryFee?: number;
  created_at: string;
  updated_at?: string;
  date?: string; // Adding this for backwards compatibility
  cancellation_reason?: string; // Adding this for orderService.ts
}

export interface Product {
  id: string;
  code?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  additionalImages?: string[];
  images?: string[];
  additionalImageFiles?: File[]; // For file uploads
  rating?: number;
  category?: string;
  tags?: string[];
  stock?: number;
  sizes?: string[];
  productId?: string; // Adding this for backwards compatibility
  options?: Record<string, string[]>;
}

export interface Category {
  id: string;
  name: string;
  count?: number;
  icon?: string; // Adding icon property
}

export interface Location {
  id: string;
  name: string;
  code: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  userId?: string; // For backwards compatibility
  userName?: string; // For display purposes
  text?: string; // For backwards compatibility
  date?: string; // For display purposes
  helpful?: number; // For feature extension
}

export interface TrackingInfo {
  id: string;
  order_id: string;
  status: string;
  location: string;
  timestamp: string;
  description?: string;
  currentLocation?: string; // For UI display
  estimatedDelivery?: string; // For UI display
  date?: string;
  time?: string;
  orderId?: string; // For backwards compatibility
  history?: { 
    status: string;
    timestamp: string;
    location: string;
    description?: string;
  }[];
}

export interface UserProfile {
  id: string;
  user_id?: string; // Making this optional to solve the AdminCustomers error
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  display_name?: string;
  phone_number?: string;
  reward_points?: number;
}

export interface ShippingAddress {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  zipCode?: string; // For backwards compatibility
  country?: string;
}
