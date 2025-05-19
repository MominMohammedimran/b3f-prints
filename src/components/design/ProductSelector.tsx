
import React from 'react';
import { formatIndianRupees } from '@/utils/currency';

interface Product {
  name: string;
  price: number;
  image: string;
}

export interface ProductSelectorProps {
  products: Record<string, Product>;
  activeProduct: string;
  isDualSided: boolean;
  onProductSelect: (productId: string) => void;
  selectedProduct?: string;
  selectedSize?: string;
  inventory?: Record<string, Record<string, number>>;
  isLoading?: boolean;
  onProductChange?: (productType: string) => void;
  onSizeChange?: (size: string) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  activeProduct,
  isDualSided,
  onProductSelect,
  onProductChange,
  selectedSize,
  selectedProduct,
  inventory,
  isLoading,
  onSizeChange
}) => {
  // Use the appropriate handler based on props provided
  const handleProductSelect = (id: string) => {
    if (onProductChange) {
      onProductChange(id);
    } else if (onProductSelect) {
      onProductSelect(id);
    }
  };

  // Handle size selection if provided
  const handleSizeChange = (size: string) => {
    if (onSizeChange) {
      onSizeChange(size);
    }
  };

  // Generate size options based on the product type
  const renderSizeOptions = () => {
    if (!selectedProduct || !inventory || isLoading) return null;

    const sizes = Object.keys(inventory[selectedProduct] || {});
    if (sizes.length === 0) return null;

    return (
      <div className="mt-4">
        <h3 className="font-medium mb-2">Select Size:</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const inStock = (inventory[selectedProduct][size] || 0) > 0;
            return (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  selectedSize === size
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : inStock 
                      ? 'border-gray-300 hover:border-blue-300' 
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!inStock}
              >
                {size} {!inStock && '(Out of stock)'}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 pt-0 mb-2">
      <h2 className="text-lg font-semibold mb-3">Select Product</h2>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(products).map(([id, product]) => (
          <button
            key={id}
            onClick={() => handleProductSelect(id)}
            className={`flex flex-col items-center p-3 rounded-md border ${
              (activeProduct === id || selectedProduct === id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="w-14 h-12 bg-gray-100 rounded-md flex items-center justify-center mb-2">
              <img src={product.image} alt={product.name} className="w-12 h-12 object-contain" />
            </div>
            <span className="text-sm font-medium">{product.name}</span>
            <span className="text-xs text-green-600">
              {formatIndianRupees(isDualSided && id === 'tshirt' ? 300 : product.price)}
            </span>
          </button>
        ))}
      </div>

      {renderSizeOptions()}
    </div>
  );
};

export default ProductSelector;
