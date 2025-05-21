
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAuthGuard from './components/admin/AdminAuthGuard';
import ProductDesigner from './pages/ProductDesigner';
import DesignTool from './pages/DesignTool';
import Payment from './pages/Payment';
import OrderComplete from './pages/OrderComplete';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsConditions from './pages/legal/TermsConditions';
import ShippingDelivery from './pages/legal/ShippingDelivery';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/order-complete" element={<OrderComplete />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/design-tool" element={<DesignTool />} />
      <Route path="/product-designer" element={<ProductDesigner />} />
      
      {/* Legal pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/shipping-delivery" element={<ShippingDelivery />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={
        <AdminAuthGuard>
          <AdminDashboard />
        </AdminAuthGuard>
      } />
      <Route path="/admin/products" element={
        <AdminAuthGuard>
          <AdminProducts />
        </AdminAuthGuard>
      } />
      <Route path="/admin/orders" element={
        <AdminAuthGuard>
          <AdminOrders />
        </AdminAuthGuard>
      } />
      <Route path="/admin/users" element={
        <AdminAuthGuard>
          <AdminUsers />
        </AdminAuthGuard>
      } />
      <Route path="/admin/customers" element={
        <AdminAuthGuard>
          <AdminCustomers />
        </AdminAuthGuard>
      } />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
