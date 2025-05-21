
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderComplete from './pages/OrderComplete';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Products from './pages/Products';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ResetPassword from './pages/ResetPassword';
import Wishlist from './pages/Wishlist';
import ProductDesigner from './pages/ProductDesigner';
import DesignTool from './pages/DesignTool';
import TrackOrder from './pages/TrackOrder';
import Orders from './pages/Orders';
import UserProfile from './pages/UserProfile';
import Account from './pages/Account';
import Search from './pages/Search';

// Admin routes
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminLocations from './pages/admin/AdminLocations';
import AdminProfiles from './pages/admin/AdminProfiles';
import AdminNotFound from './pages/admin/AdminNotFound';

// Legal pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsConditions from './pages/legal/TermsConditions';
import ShippingDelivery from './pages/legal/ShippingDelivery';
import CancellationRefund from './pages/legal/CancellationRefund';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/order-complete" element={<OrderComplete />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/product-designer" element={<ProductDesigner />} />
      <Route path="/design-tool" element={<DesignTool />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/account" element={<Account />} />
      <Route path="/search" element={<Search />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/customers" element={<AdminCustomers />} />
      <Route path="/admin/locations" element={<AdminLocations />} />
      <Route path="/admin/profiles" element={<AdminProfiles />} />

      {/* Legal pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/shipping-delivery" element={<ShippingDelivery />} />
      <Route path="/cancellation-refund" element={<CancellationRefund />} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
