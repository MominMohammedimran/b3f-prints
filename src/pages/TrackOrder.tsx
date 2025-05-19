
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import OrderTrackingStatus from '../components/orders/OrderTrackingStatus';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import OrderLoadingState from '../components/orders/OrderLoadingState';
import OrderErrorState from '../components/orders/OrderErrorState';
import { toast } from 'sonner';
import { updateInventoryForDeliveredOrder } from '@/utils/productInventory';

const TrackOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { tracking, loading, error } = useOrderTracking(orderId || '');
  
  useEffect(() => {
    // Check if order is delivered and update inventory if needed
    if (tracking && ['delivered', 'completed'].includes(tracking.status)) {
      updateInventoryForDeliveredOrder(orderId || '');
    }
  }, [tracking, orderId]);

  if (loading) {
    return <OrderLoadingState />;
  }

  if (error || !tracking) {
    return <OrderErrorState error={error?.message || 'Error loading tracking information'} />;
  }

  // Format estimated delivery date
  const estimatedDelivery = tracking.estimatedDelivery || 
    (tracking.status === 'delivered' || tracking.status === 'completed' ? 
      'Delivered' : 'To be confirmed');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/orders" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold ml-4">Track Order #{tracking.orderNumber || tracking.id}</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <OrderTrackingStatus 
            currentStatus={tracking.status}
            estimatedDelivery={estimatedDelivery}
          />
          
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{new Date(tracking.timestamp).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Delivery</p>
                <p className="font-medium">{estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Location</p>
                <p className="font-medium">{tracking.currentLocation || tracking.location || 'Processing at warehouse'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-medium">{tracking.orderNumber || tracking.id || 'Not available'}</p>
              </div>
            </div>
          </div>
          
          {tracking.history && tracking.history.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Tracking History</h2>
              <div className="space-y-4">
                {tracking.history.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                    <div>
                      <p className="font-medium">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</p>
                      <p className="text-sm text-gray-500">{item.location} - {new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Order Items */}
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {Array.isArray(tracking.items) && tracking.items.map((item, index) => (
                <div key={index} className="flex items-center border-b border-gray-100 pb-4">
                  <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={item.image || 'https://via.placeholder.com/150'} 
                      alt={item.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="text-sm text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.quantity > 1 && <span className="ml-2">Qty: {item.quantity}</span>}
                      <span className="ml-2">₹{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shipping Address */}
          {tracking.shippingAddress && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">{tracking.shippingAddress.fullName}</p>
                <p>{tracking.shippingAddress.addressLine1}</p>
                {tracking.shippingAddress.addressLine2 && (
                  <p>{tracking.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {tracking.shippingAddress.city}, {tracking.shippingAddress.state}{' '}
                  {tracking.shippingAddress.postalCode}
                </p>
                <p>{tracking.shippingAddress.country}</p>
                <p>Phone: {tracking.shippingAddress.phone}</p>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-center">
            <Button onClick={() => toast('Support team contacted', { description: 'Our team will get back to you soon' })}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;
