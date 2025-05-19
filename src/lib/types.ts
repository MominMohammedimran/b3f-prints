
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
  additionalImageFiles?: File[];
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
  user_email?: string;
  cancellation_reason?: string;
  deliveryFee?: number; // For backward compatibility
  shippingAddress?: any; // For backward compatibility
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
  name?: string; // For backward compatibility
  street?: string; // For backward compatibility
  zipCode?: string; // For backward compatibility
  zipcode?: string; // For backward compatibility
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
  icon?: string; // Add icon property
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  username: string;
  createdAt: string;
  user_id?: string; // For backward compatibility
  product_id?: string; // For backward compatibility
  created_at?: string; // For backward compatibility
  text?: string; // For backward compatibility
  date?: string; // For backward compatibility
  helpful?: number; // For backward compatibility
  userName?: string; // For backward compatibility
}

export interface Location {
  id: string;
  name: string;
  code: string;
}

// Add AdminUser interface
export interface AdminUser {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}
