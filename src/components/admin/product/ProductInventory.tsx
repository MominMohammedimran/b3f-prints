
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductInventory, updateProductInventory } from '@/utils/productInventory';
import { Loader2, Save } from 'lucide-react';

const ProductInventory = () => {
  const [inventory, setInventory] = useState<Record<string, Record<string, number>>>({
    tshirt: { S: 0, M: 0, L: 0, XL: 0 },
    mug: { Standard: 0 },
    cap: { Standard: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await getProductInventory();
        setInventory(data);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        toast.error('Failed to fetch inventory data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);
  
  const handleQuantityChange = (productType: string, size: string, value: string) => {
    const quantity = parseInt(value, 10) || 0;
    setInventory(prev => ({
      ...prev,
      [productType]: {
        ...prev[productType],
        [size]: quantity
      }
    }));
  };
  
  const handleSaveInventory = async (productType: string, size: string) => {
    try {
      setSaving(true);
      const quantity = inventory[productType][size];
      const success = await updateProductInventory(productType, size, quantity);
      
      if (success) {
        toast.success(`Updated ${productType} ${size} inventory to ${quantity}`);
      } else {
        throw new Error('Failed to update inventory');
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast.error('Failed to update inventory');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-0">
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Manage product inventory levels</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Product Inventory</CardTitle>
        <CardDescription>Manage product inventory levels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* T-shirts */}
        <div>
          <h3 className="text-lg font-medium mb-3">T-shirts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(inventory.tshirt).map(([size, quantity]) => (
              <div key={`tshirt-${size}`} className="flex items-center space-x-2">
                <div className="w-12 text-sm font-medium">{size}</div>
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => handleQuantityChange('tshirt', size, e.target.value)}
                  className="w-24"
                />
                <Button 
                  size="sm" 
                  onClick={() => handleSaveInventory('tshirt', size)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mugs */}
        <div>
          <h3 className="text-lg font-medium mb-3">Mugs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(inventory.mug).map(([size, quantity]) => (
              <div key={`mug-${size}`} className="flex items-center space-x-2">
                <div className="w-12 text-sm font-medium">{size}</div>
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => handleQuantityChange('mug', size, e.target.value)}
                  className="w-24"
                />
                <Button 
                  size="sm" 
                  onClick={() => handleSaveInventory('mug', size)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Caps */}
        <div>
          <h3 className="text-lg font-medium mb-3">Caps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(inventory.cap).map(([size, quantity]) => (
              <div key={`cap-${size}`} className="flex items-center space-x-2">
                <div className="w-12 text-sm font-medium">{size}</div>
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => handleQuantityChange('cap', size, e.target.value)}
                  className="w-24"
                />
                <Button 
                  size="sm" 
                  onClick={() => handleSaveInventory('cap', size)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">
          Inventory is automatically updated when orders are placed or when manually adjusted here.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProductInventory;
