import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
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
import { ShoppingCart, Heart, User, Menu, Package } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, className }) => (
  <li>
    <Link to={href} className={cn("font-medium text-sm hover:text-blue-600 transition-colors", className)}>
      {children}
    </Link>
  </li>
);

const Navbar = () => {
  const { currentUser, signOut, userProfile } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center text-xl font-bold text-blue-600">
          <img src="/logo.svg" alt="B3FASHION Logo" className="mr-2 h-6 w-auto" />
          B3FASHION
        </Link>

        {/* Search Bar (conditionally rendered) */}
        {!isAdminRoute && (
          <div className="w-full max-w-md mx-4">
            <Input type="search" placeholder="Search products..." className="rounded-full" />
          </div>
        )}

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center space-x-6">
          {!isAdminRoute && (
            <>
              <NavItem href="/products">Products</NavItem>
              <NavItem href="/about">About</NavItem>
              <NavItem href="/contact">Contact</NavItem>
            </>
          )}
        </ul>

        {/* Mobile Menu (Hamburger Icon) */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isAdminRoute && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/products">Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/about">About</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/contact">Contact</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {currentUser ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/signin">Sign In</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Auth and Cart/Wishlist Links */}
        <div className="flex items-center space-x-4">
          {!isAdminRoute && (
            <>
              <Link to="/wishlist" className="relative hover:text-blue-600 transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link to="/orders" className="relative hover:text-blue-600 transition-colors">
                <Package className="h-5 w-5" />
              </Link>
            </>
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
                {isAdminRoute ? null : (
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">Wishlist</Link>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
