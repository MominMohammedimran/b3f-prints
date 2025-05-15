
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings,
  Map, 
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: Package
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: FileText
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: Users
    },
    {
      name: 'Locations',
      path: '/admin/locations',
      icon: Map
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  return (
    <div className="h-full w-64 flex-shrink-0 bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link to="/admin/dashboard" className="text-xl font-bold">Admin Panel</Link>
      </div>
      
      <nav className="flex flex-col p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-800 transition-colors",
              isActive(item.path) && "bg-gray-800 text-blue-500"
            )}
          >
            <item.icon size={20} className="mr-3" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
