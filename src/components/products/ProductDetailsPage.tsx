
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import Layout from '../layout/Layout';
import { Product } from '../../lib/types';
import { products } from '../../lib/data';
import ProductDetailsContent from './details/ProductDetailsContent';
import { toast } from 'sonner';

const ProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    if (!productId) return;
    
    // Always load product from mock data for now
    const foundProduct = products.find((p) => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Provide a default product if none found
      const defaultProduct = {
        id: productId || "default-product",
        code: "SAMPLE-001",
        name: "Sample Product",
        description: "This is a sample product description.",
        price: 99.99,
        originalPrice: 129.99,
        discountPercentage: 20,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500",
        rating: 4.5,
        category: "Sample Category",
        tags: ["featured", "new"],
        stock: 15
      };
      
      setProduct(defaultProduct);
    }
  }, [productId, navigate]);

  const handleShareProduct = () => {
    // Create the URL to share
    const shareUrl = window.location.href;
    
    // Use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Check out this product',
        text: product?.description || 'I found this amazing product!',
        url: shareUrl,
      })
      .then(() => toast.success('Shared successfully'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback to clipboard if Web Share API is not available
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };

  return (
    <Layout>
      <div className="container-custom">
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center">
            <Link to="/" className="mr-2">
              <ArrowLeft size={24} className="back-arrow" />
            </Link>
            <h1 className="text-2xl font-bold text-green-600">{product?.name || 'Product Details'}</h1>
          </div>
          
          <button 
            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            onClick={handleShareProduct}
          >
            <Share2 size={18} className="mr-1" />
            Share
          </button>
        </div>

        {product ? (
          <ProductDetailsContent product={product} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Product details are not available.</p>
          </div>
        )}

        {product && <RelatedProducts product={product} onProductClick={(product) => navigate(`/product/details/${product.id}`)} />}
      </div>
    </Layout>
  );
};

// Add the import here to fix the reference issue
import WishlistButton from './WishlistButton';
import RelatedProducts from './RelatedProducts';

export default ProductDetailsPage;
