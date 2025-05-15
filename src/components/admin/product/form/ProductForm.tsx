
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import ProductBasicInfo from './ProductBasicInfo';
import ProductInventoryInfo from './ProductInventoryInfo';
import ProductDescription from './ProductDescription';
import ProductVariants from './ProductVariants';

interface ProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Product>({...product});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'discountPercentage' || name === 'stock' 
        ? parseFloat(value) || 0 
        : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
    
    // Clear error for category
    if (errors.category) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.category;
        return newErrors;
      });
    }
  };

  const handleSizesChange = (sizes: string[]) => {
    setFormData(prev => ({
      ...prev,
      sizes
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.code.trim()) {
      newErrors.code = "Product code is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than zero";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <ProductBasicInfo 
        name={formData.name}
        code={formData.code}
        category={formData.category}
        price={formData.price}
        errors={errors}
        onChange={handleChange}
        onCategoryChange={handleCategoryChange}
      />
      
      {/* Inventory & Pricing Section */}
      <ProductInventoryInfo 
        originalPrice={formData.originalPrice}
        discountPercentage={formData.discountPercentage}
        stock={formData.stock || 0}
        onChange={handleChange}
      />
      
      {/* Variants Section */}
      <ProductVariants 
        sizes={formData.sizes || []}
        tags={formData.tags || []}
        onSizesChange={handleSizesChange}
        onTagsChange={handleTagsChange}
      />
      
      {/* Description Section */}
      <ProductDescription 
        description={formData.description}
        onChange={handleChange}
      />
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Product
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
