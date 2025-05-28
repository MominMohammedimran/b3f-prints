
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { fabric } from 'fabric';

interface DesignPreviewCardProps {
  designData?: any;
  previewImage?: string;
  orderNumber: string;
  productName: string;
}

const DesignPreviewCard: React.FC<DesignPreviewCardProps> = ({
  designData,
  previewImage,
  orderNumber,
  productName
}) => {
  const downloadDesignAsPNG = async () => {
    try {
      if (!designData) {
        // If no design data, download preview image
        if (previewImage) {
          const link = document.createElement('a');
          link.href = previewImage;
          link.download = `${orderNumber}-${productName}-design.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return;
      }

      // Create a temporary canvas to render the design
      const tempCanvas = new fabric.Canvas(null, {
        width: designData.width || 500,
        height: designData.height || 600,
        backgroundColor: designData.backgroundColor || '#ffffff'
      });

      // Load the design data into the temporary canvas
      tempCanvas.loadFromJSON(designData, () => {
        // Generate PNG data URL
        const dataURL = tempCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2 // Higher resolution
        });

        // Create download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${orderNumber}-${productName}-design.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        tempCanvas.dispose();
      });
    } catch (error) {
      console.error('Error downloading design:', error);
      // Fallback to preview image if available
      if (previewImage) {
        const link = document.createElement('a');
        link.href = previewImage;
        link.download = `${orderNumber}-${productName}-design.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const viewDesign = () => {
    if (previewImage) {
      window.open(previewImage, '_blank');
    }
  };

  if (!designData && !previewImage) {
    return (
      <div className="text-sm text-gray-500">
        No design data available
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Custom Design</h4>
        <div className="flex gap-2">
          {previewImage && (
            <Button
              size="sm"
              variant="outline"
              onClick={viewDesign}
              className="flex items-center gap-1"
            >
              <Eye size={14} />
              View
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={downloadDesignAsPNG}
            className="flex items-center gap-1"
          >
            <Download size={14} />
            Download PNG
          </Button>
        </div>
      </div>
      
      {previewImage && (
        <div className="mb-3">
          <img
            src={previewImage}
            alt="Design Preview"
            className="w-full max-w-32 h-auto border rounded"
          />
        </div>
      )}
      
      <div className="text-xs text-gray-600">
        Product: {productName}
      </div>
    </div>
  );
};

export default DesignPreviewCard;
