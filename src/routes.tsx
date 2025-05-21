
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderComplete from './pages/OrderComplete';
import Products from './pages/Products';
import Wishlist from './pages/Wishlist';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignUp from './pages/admin/AdminSignUp';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLocations from './pages/admin/AdminLocations';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAuthGuard from './components/admin/AdminAuthGuard';
import DesignTool from './pages/DesignTool';
import Account from './pages/Account';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/order-complete" element={<OrderComplete />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/design" element={<DesignTool />} />
      <Route path="/account" element={<Account />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/track-order/:id" element={<TrackOrder />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/signup" element={<AdminSignUp />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminAuthGuard>
            <AdminDashboard />
          </AdminAuthGuard>
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          <AdminAuthGuard>
            <AdminProducts />
          </AdminAuthGuard>
        } 
      />
      <Route 
        path="/admin/orders" 
        element={
          <AdminAuthGuard>
            <AdminOrders />
          </AdminAuthGuard>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminAuthGuard>
            <AdminUsers />
          </AdminAuthGuard>
        } 
      />
      <Route 
        path="/admin/locations" 
        element={
          <AdminAuthGuard>
            <AdminLocations />
          </AdminAuthGuard>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <AdminAuthGuard>
            <AdminSettings />
          </AdminAuthGuard>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
