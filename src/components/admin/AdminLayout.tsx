
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { isAdminAuthenticated } from '@/utils/adminAuth';
import { Loader2, Home, ShoppingCart, Package, Users, Settings } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (title) {
      document.title = `${title} - B3F Prints Admin`;
    } else {
      document.title = 'B3F Prints Admin';
    }
  }, [title]);
  
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setCheckingAuth(true);
        
        if (!currentUser) {
          console.log('No current user, redirecting to admin login');
          navigate('/admin/login');
          return;
        }
        
        console.log('Verifying admin status for user:', currentUser.email);
        
        const adminAuthorized = await isAdminAuthenticated();
        
        if (!adminAuthorized) {
          console.log('User is not an admin, redirecting to admin login');
          toast.error('You do not have admin privileges');
          navigate('/admin/login');
          return;
        }
        
        console.log('Admin authorization confirmed');
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        toast.error('Error verifying admin status');
        navigate('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    };
    
    verifyAdmin();
  }, [currentUser, navigate]);

  const bottomNavItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', isActive: location.pathname === '/admin' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', isActive: location.pathname === '/admin/orders' },
    { path: '/admin/products', icon: Package, label: 'Products', isActive: location.pathname === '/admin/products' },
    { path: '/admin/website-users', icon: Users, label: 'Website users', isActive: location.pathname === '/admin/website-users' },
    { path: '/admin/settings', icon: Settings, label: 'Settings', isActive: location.pathname === '/admin/settings' },
  ];
  
  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <AdminSidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <AdminHeader 
            title={title} 
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around py-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    item.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
