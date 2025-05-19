import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { MicroservicesProvider } from './context/MicroservicesContext';

import { CartProvider } from './context/CartContext';

import './App.css';
import Index from './pages/Index';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';
import OrderComplete from './pages/OrderComplete';
import UserProfile from './pages/UserProfile';
import Account from './pages/Account';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

import DesignTool from './pages/DesignTool';
import AuthCallback from './pages/AuthCallback';
import ProductDesigner from './pages/ProductDesigner';
import ProductPage from './pages/ProductPage';

// Legal pages
import TermsConditions from './pages/legal/TermsConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import ShippingDelivery from './pages/legal/ShippingDelivery';
import CancellationRefund from './pages/legal/CancellationRefund';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderView from './pages/admin/AdminOrderView';
import AdminProfiles from './pages/admin/AdminProfiles';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLocations from './pages/admin/AdminLocations';
import AdminNotFound from './pages/admin/AdminNotFound';
import AdminUserDetails from './pages/admin/AdminUserDetails';

// Add the new route for AdminUserDetails

// Within the routes configuration, add this route:
// <Route path="/admin/users/:userId" element={<AdminUserDetails />} />

import { Toaster } from "@/components/ui/toaster";
import { ensureAdminExists } from './utils/setupInitialAdmin';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
});

function App() {
  const [isAdminSetupDone, setIsAdminSetupDone] = useState(false);
  
  useEffect(() => {
    // Initialize admin users on app startup
    const setupAdmin = async () => {
      try {
        // Ensure our specific admin exists
        await ensureAdminExists();
        setIsAdminSetupDone(true);
      } catch (error) {
         setIsAdminSetupDone(true); // Continue anyway to not block the app
      }
    };
    
    setupAdmin();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <MicroservicesProvider>
        
              <CartProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:productId" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/track-order/:orderId" element={<TrackOrder />} />
                  <Route path="/order-complete/:orderId" element={<OrderComplete />} />
                  <Route path="/profile" element={<Account/>} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/search" element={<Search />} />
                  
                  <Route path="/design-tool" element={<DesignTool />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/product/details/:productId" element={<ProductDetails />} />
                  <Route path="/products/:category" element={<ProductPage />} />
                  
                  {/* Legal Pages */}
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/shipping-delivery" element={<ShippingDelivery />} />
                  <Route path="/cancellation-refund" element={<CancellationRefund />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/orders/:orderId" element={<AdminOrderView />} />
                  <Route path="/admin/profiles" element={<AdminProfiles />} />
                  <Route path="/admin/customers" element={<AdminCustomers />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/locations" element={<AdminLocations />} />
                  <Route path="/admin/users/:userId" element={<AdminUserDetails />} />
                  <Route path="/admin/*" element={<AdminNotFound />} />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
               
              </CartProvider>
            
          </MicroservicesProvider>
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
