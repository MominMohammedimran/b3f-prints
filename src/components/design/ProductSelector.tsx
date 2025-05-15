
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSelectorProps {
  onProductChange?: (product: string) => void;
  onSizeChange?: (size: string) => void;
  selectedProduct?: string;
  selectedSize?: string;
  inventory?: Record<string, Record<string, number>>;
  isLoading?: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onProductChange = () => {},
  onSizeChange = () => {},
  selectedProduct = 'tshirt',
  selectedSize = '',
  inventory = {
    tshirt: { S: 0, M: 0, L: 0, XL: 0 },
    mug: { Standard: 0 },
    cap: { Standard: 0 }
  },
  isLoading = false
}) => {
  const handleTabChange = (value: string) => {
    onProductChange(value);
  };
  
  const getProductImage = (product: string) => {
    switch (product) {
      case 'tshirt':
        return '/lovable-uploads/design-tool-page/tshirt-print.png';
      case 'mug':
        return '/lovable-uploads/design-tool-page/mug-print.png';
      case 'cap':
        return '/lovable-uploads/design-tool-page/cap-print.png';
      default:
        return '/lovable-uploads/design-tool-page/tshirt-print.png';
    }
  };
  
  const renderSizeSelector = (product: string) => {
    let sizes: string[] = [];
    
    // Get available sizes based on product
    switch (product) {
      case 'tshirt':
        sizes = ['S', 'M', 'L', 'XL'];
        break;
      case 'mug':
      case 'cap':
        sizes = ['Standard'];
        break;
      default:
        sizes = [];
    }
    
    if (isLoading) {
      return (
        <div className="mt-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-12" />
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <Label className="mb-2 block">Select Size:</Label>
        <RadioGroup 
          value={selectedSize} 
          onValueChange={onSizeChange}
          className="flex flex-wrap gap-4"
        >
          {sizes.map(size => {
            const currentStock = inventory[product]?.[size] || 0;
            const isOutOfStock = currentStock <= 0;
            
            return (
              <div key={size} className="flex items-center">
                <RadioGroupItem 
                  value={size} 
                  id={`size-${product}-${size}`} 
                  disabled={isOutOfStock}
                  className="peer sr-only"
                />
                <Label 
                  htmlFor={`size-${product}-${size}`}
                  className={`
                    flex min-w-10 items-center justify-center rounded-md border border-gray-200 
                    px-3 py-2 text-sm font-medium peer-data-[state=checked]:border-blue-600 
                    peer-data-[state=checked]:text-blue-600 peer-data-[state=checked]:bg-blue-50
                    ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                  `}
                >
                  {size}
                  {isOutOfStock && <span className="ml-1 text-xs text-red-500">(Out of stock)</span>}
                  {!isOutOfStock && <span className="ml-1 text-xs text-green-500">({currentStock} in stock)</span>}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    );
  };

  return (
    <Tabs value={selectedProduct} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tshirt">T-Shirt</TabsTrigger>
        <TabsTrigger value="mug">Mug</TabsTrigger>
        <TabsTrigger value="cap">Cap</TabsTrigger>
      </TabsList>
      <TabsContent value="tshirt" className="mt-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <div className="border rounded-md overflow-hidden bg-white">
              <AspectRatio ratio={1}>
                <img 
                  src={getProductImage('tshirt')}
                  alt="T-Shirt" 
                  className="w-full h-full object-contain"
                />
              </AspectRatio>
            </div>
            {renderSizeSelector('tshirt')}
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-semibold mb-2">Custom T-Shirt</h3>
            <p className="text-gray-600 mb-4">
              High-quality cotton t-shirt, perfect for custom designs.
              Available in multiple sizes.
            </p>
            <div className="bg-blue-50 p-3 rounded-md mb-4">
              <h4 className="font-medium text-blue-700">Design Tips:</h4>
              <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
                <li>Use bright colors that contrast with the shirt</li>
                <li>Recommended area: 10" × 12" centered on chest</li>
                <li>Allow 0.5" margin from edges</li>
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="mug" className="mt-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <div className="border rounded-md overflow-hidden bg-white">
              <AspectRatio ratio={1}>
                <img 
                  src={getProductImage('mug')}
                  alt="Mug" 
                  className="w-full h-full object-contain"
                />
              </AspectRatio>
            </div>
            {renderSizeSelector('mug')}
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-semibold mb-2">Custom Mug</h3>
            <p className="text-gray-600 mb-4">
              Ceramic mug perfect for custom designs and logos.
              Microwave and dishwasher safe.
            </p>
            <div className="bg-blue-50 p-3 rounded-md mb-4">
              <h4 className="font-medium text-blue-700">Design Tips:</h4>
              <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
                <li>Recommended area: 3.5" × 3" centered</li>
                <li>Allow 0.25" margin from top and bottom</li>
                <li>Simple designs work best on curved surfaces</li>
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="cap" className="mt-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <div className="border rounded-md overflow-hidden bg-white">
              <AspectRatio ratio={1}>
                <img 
                  src={getProductImage('cap')}
                  alt="Cap" 
                  className="w-full h-full object-contain"
                />
              </AspectRatio>
            </div>
            {renderSizeSelector('cap')}
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-semibold mb-2">Custom Cap</h3>
            <p className="text-gray-600 mb-4">
              Adjustable cotton cap for custom embroidery or printing.
              One size fits all with adjustable strap.
            </p>
            <div className="bg-blue-50 p-3 rounded-md mb-4">
              <h4 className="font-medium text-blue-700">Design Tips:</h4>
              <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
                <li>Recommended area: 2.5" × 2" centered on front</li>
                <li>Simple designs with fewer colors work best</li>
                <li>Consider text readability on curved surface</li>
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProductSelector;
