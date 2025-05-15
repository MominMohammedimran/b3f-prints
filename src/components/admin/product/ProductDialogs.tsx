
import React from 'react';
import { Product } from '@/lib/types';
import ProductEditForm from '@/components/admin/ProductEditForm';
import ImageDropzone from '@/components/ImageDropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductDialogsProps {
  showEditDialog: boolean;
  showAddDialog: boolean;
  selectedProduct: Product | null;
  imagePreviewUrl: string;
  onEditDialogChange: (open: boolean) => void;
  onAddDialogChange: (open: boolean) => void;
  onImageSelected: (file: File, previewUrl: string) => void;
  onSaveProduct: (product: Product) => void;
}

const ProductDialogs: React.FC<ProductDialogsProps> = ({
  showEditDialog,
  showAddDialog,
  selectedProduct,
  imagePreviewUrl,
  onEditDialogChange,
  onAddDialogChange,
  onImageSelected,
  onSaveProduct
}) => {
  return (
    <>
      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={onEditDialogChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to the product information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Product Image</h3>
            <ImageDropzone onImageSelected={onImageSelected} />
            {imagePreviewUrl && (
              <div className="mt-2 text-sm text-gray-500">
                Current image will be kept unless a new one is uploaded.
              </div>
            )}
          </div>
          
          {selectedProduct && (
            <ProductEditForm 
              product={{
                ...selectedProduct,
                image: imagePreviewUrl || selectedProduct.image
              }}
              onSave={onSaveProduct}
              onCancel={() => onEditDialogChange(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={onAddDialogChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Product Image</h3>
            <ImageDropzone onImageSelected={onImageSelected} />
          </div>
          
          <ProductEditForm 
            product={{
              id: '',
              code: '',
              name: '',
              description: '',
              price: 0,
              originalPrice: 0,
              discountPercentage: 0,
              image: imagePreviewUrl,
              rating: 0,
              category: '',
              tags: [],
              sizes: [],
              stock: 0
            }}
            onSave={onSaveProduct}
            onCancel={() => onAddDialogChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDialogs;
