
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu, Package, MapPin, Home, Phone, Info } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils';
import { useLocation as useLocationContext } from '@/context/LocationContext';
import LocationPopup from '../ui/LocationPopup';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, className, icon }) => (
  <li>
    <Link to={href} className={cn("font-medium text-sm hover:text-blue-600 transition-colors flex items-center gap-1", className)}>
      {icon}
      {children}
    </Link>
  </li>
);

const Navbar = () => {
  const { currentUser, signOut, userProfile } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLocation } = useLocationContext();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/signin');
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav className="bg-white py-4 shadow-md sticky top-0 z-50">
      {showLocationPopup && <LocationPopup onClose={() => setShowLocationPopup(false)} />}
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center text-xl font-bold text-blue-600">
            <img src="/logo.svg" alt="B3FASHION Logo" className="mr-2 h-8 w-auto" />
            B3FASHION
          </Link>

          {/* Location Selector */}
          {!isAdminRoute && (
            <button 
              onClick={() => setShowLocationPopup(true)}
              className="hidden md:flex items-center text-gray-700 hover:text-blue-600 transition-colors"
            >
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{currentLocation?.name || "Select Location"}</span>
            </button>
          )}

          {/* Cart and User links on the right */}
          <div className="flex items-center space-x-4">
            {!isAdminRoute && (
              <Link to="/orders" className="relative hover:text-blue-600 transition-colors">
                <Package className="h-5 w-5" />
              </Link>
            )}
            
            {!isAdminRoute && (
              <Link to="/cart" className="relative hover:text-blue-600 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* User Avatar or Sign In Link */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.display_name} />
                      <AvatarFallback>{userProfile?.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {isAdminRoute ? null : (
                    <DropdownMenuItem asChild>
                      <Link to="/orders">Orders</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              !isAdminRoute && (
                <Link to="/signin" className="font-medium text-sm hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
              )
            )}
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              className="md:hidden p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Navigation Links below logo and cart */}
        <div className="mt-4 hidden md:block">
          <ul className="flex items-center space-x-6 justify-center">
            {!isAdminRoute && (
              <>
                <NavItem href="/" icon={<Home size={16} className="mr-1" />}>Home</NavItem>
                <NavItem href="/products" icon={<ShoppingCart size={16} className="mr-1" />}>Products</NavItem>
                <NavItem href="/about" icon={<Info size={16} className="mr-1" />}>About</NavItem>
                <NavItem href="/contact" icon={<Phone size={16} className="mr-1" />}>Contact</NavItem>
                <NavItem href="/design-tool">Custom Design</NavItem>
              </>
            )}
          </ul>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 md:hidden border-t pt-4">
            <ul className="flex flex-col space-y-3">
              {!isAdminRoute && (
                <>
                  <NavItem href="/" icon={<Home size={16} className="mr-1" />}>Home</NavItem>
                  <NavItem href="/products" icon={<ShoppingCart size={16} className="mr-1" />}>Products</NavItem>
                  <NavItem href="/about" icon={<Info size={16} className="mr-1" />}>About</NavItem>
                  <NavItem href="/contact" icon={<Phone size={16} className="mr-1" />}>Contact</NavItem>
                  <NavItem href="/design-tool">Custom Design</NavItem>
                  <button 
                    onClick={() => setShowLocationPopup(true)}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{currentLocation?.name || "Select Location"}</span>
                  </button>
                </>
              )}
            </ul>
          </div>
        )}
        
        {/* Search bar */}
        {!isAdminRoute && (
          <div className="mt-4 hidden md:block">
            <Input type="search" placeholder="Search products..." className="rounded-full max-w-md mx-auto" />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
