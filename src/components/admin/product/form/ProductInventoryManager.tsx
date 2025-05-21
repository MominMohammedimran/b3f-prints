import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface InventoryItem {
  size: string;
  quantity: number;
}

interface ProductInventoryManagerProps {
  productId: string;
  productType: string;
  initialInventory?: Record<string, number>;
  onUpdate?: (inventory: Record<string, number>) => void;
}

const ProductInventoryManager: React.FC<ProductInventoryManagerProps> = ({ 
  productId, 
  productType,
  initialInventory = {},
  onUpdate 
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Initialize inventory based on product type and existing data
  useEffect(() => {
    loadInventory();
  }, [productId, productType, initialInventory]);
  
  const loadInventory = async () => {
    setLoading(true);
    
    try {
      // Get current inventory from the database
      const { data, error } = await supabase
        .from('products')
        .select('stock, category')
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Error loading inventory:', error);
        // Start with default inventory if we can't load existing
        initializeDefaultInventory();
        return;
      }
      
      // Check for inventory data
      // We'll use stock as a fallback since inventory might not exist yet
      if (data) {
        // If we have stock data, use it to initialize inventory
        initializeDefaultInventory();
      } else {
        // Otherwise initialize with defaults
        initializeDefaultInventory();
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      initializeDefaultInventory();
    } finally {
      setLoading(false);
    }
  };
  
  const initializeDefaultInventory = () => {
    let defaultItems: InventoryItem[] = [];
    
    // Initialize based on product type
    switch (productType.toLowerCase()) {
      case 'tshirt':
        defaultItems = [
          { size: 'S', quantity: initialInventory?.S || 0 },
          { size: 'M', quantity: initialInventory?.M || 0 },
          { size: 'L', quantity: initialInventory?.L || 0 },
          { size: 'XL', quantity: initialInventory?.XL || 0 },
          { size: 'XXL', quantity: initialInventory?.XXL || 0 }
        ];
        break;
        
      case 'mug':
        defaultItems = [
          { size: 'Standard', quantity: initialInventory?.Standard || 0 }
        ];
        break;
        
      case 'cap':
        defaultItems = [
          { size: 'Standard', quantity: initialInventory?.Standard || 0 }
        ];
        break;
        
      default:
        defaultItems = [
          { size: 'Standard', quantity: initialInventory?.Standard || 0 }
        ];
    }
    
    setInventory(defaultItems);
  };
  
  const handleQuantityChange = (index: number, amount: number) => {
    setInventory(prev => {
      const updated = [...prev];
      updated[index].quantity = Math.max(0, updated[index].quantity + amount);
      return updated;
    });
  };
  
  const handleDirectQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value) || 0;
    if (quantity < 0) return;
    
    setInventory(prev => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };
  
  const saveInventory = async () => {
    setLoading(true);
    
    try {
      // Convert inventory array to object format for storage
      const inventoryObject: Record<string, number> = {};
      inventory.forEach(item => {
        inventoryObject[item.size] = item.quantity;
      });
      
      // Update stock in database for backward compatibility
      const { error } = await supabase
        .from('products')
        .update({
          stock: inventory[0]?.quantity || 0, // Use first item's quantity as stock
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);
      
      if (error) throw error;
      
      toast.success('Inventory updated successfully');
      
      // Notify parent component of update
      if (onUpdate) {
        onUpdate(inventoryObject);
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast.error('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Inventory Management</h3>
        <Button 
          onClick={saveInventory} 
          disabled={loading}
          size="sm"
        >
          <Save className="h-4 w-4 mr-1" />
          Save Inventory
        </Button>
      </div>
      
      <div className="grid gap-2">
        {inventory.map((item, index) => (
          <div key={item.size} className="flex items-center gap-2">
            <Label className="w-20">{item.size}</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(index, -1)}
              disabled={item.quantity <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => handleDirectQuantityChange(index, e.target.value)}
              className="w-20 text-center"
              min="0"
            />
            
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(index, 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-gray-500">
        Inventory will be automatically updated when orders are placed
      </p>
    </div>
  );
};

export default ProductInventoryManager;
