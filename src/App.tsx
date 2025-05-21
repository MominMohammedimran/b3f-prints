
import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { Toaster } from 'sonner'; 
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { initializeAppSecurity } from './utils/initializeSecurity';

function App() {
  // Initialize security features
  useEffect(() => {
    initializeAppSecurity();
  }, []);

  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
