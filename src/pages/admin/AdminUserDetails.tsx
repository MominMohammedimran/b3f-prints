import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, MapPin, Package, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import UserOrderHistory from '@/components/admin/users/UserOrderHistory';

const AdminUserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  
  const { 
    data: userProfile, 
    isLoading: profileLoading,
    error: profileError,
    refetch 
  } = useQuery({
    queryKey: ['adminUserProfile', userId],
    queryFn: () => fetchUserProfile(),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });

  const { 
    data: userAddresses = [], 
    isLoading: addressesLoading,
  } = useQuery({
    queryKey: ['userAddresses', userId],
    queryFn: fetchUserAddresses,
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
  
  async function fetchUserProfile() {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    return data;
  }
  
  async function fetchUserAddresses() {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
    
    return data || [];
  }

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['userAddresses', userId] });
      toast.success('Address deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete address: ${error.message}`);
    }
  };
  
  if (profileLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="ml-2">Loading user details...</span>
        </div>
      </AdminLayout>
    );
  }
  
  if (profileError || !userProfile) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading user details.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/users')} 
              className="mr-2"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {userProfile.first_name} {userProfile.last_name}
                </CardTitle>
                <CardDescription>{userProfile.email}</CardDescription>
              </div>
              <Badge>{userProfile.reward_points || 0} Points</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Name</h3>
                  <p>{userProfile.first_name} {userProfile.last_name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Email</h3>
                  <p>{userProfile.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Phone</h3>
                  <p>{userProfile.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Member Since</h3>
                  <p>{new Date(userProfile.created_at).toLocaleDateString()}</p>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button variant="outline" className="flex items-center">
                    <User size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="addresses">
                {addressesLoading ? (
                  <div className="py-8 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
                    <p className="mt-2">Loading addresses...</p>
                  </div>
                ) : userAddresses.length === 0 ? (
                  <div className="py-8 text-center bg-gray-50 rounded-md">
                    <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-gray-600">No addresses found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAddresses.map((address) => (
                      <Card key={address.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{address.name}</h3>
                              <p className="text-gray-600">{address.street}</p>
                              <p className="text-gray-600">{address.city}, {address.state} {address.zipcode}</p>
                              <p className="text-gray-600">{address.country}</p>
                              {address.is_default && <Badge className="mt-2">Default</Badge>}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="orders">
                <UserOrderHistory userId={userId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetails;
