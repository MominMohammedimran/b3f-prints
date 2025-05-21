
import React, { useEffect, useState } from 'react';

interface BoundaryBoxProps {
  productType: string;
  className?: string;
  children?: React.ReactNode;
}

const BoundaryBox: React.FC<BoundaryBoxProps> = ({ productType, className, children }) => {
  const [dimensions, setDimensions] = useState({ 
    width: '280px', 
    height: '350px', 
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)'
  });
  
  // Update dimensions when product type changes
  useEffect(() => {
    switch(productType.toLowerCase()) {
      case 'tshirt':
        setDimensions({ 
          width: '280px', 
          height: '350px', 
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)'
        });
        break;
        
      case 'mug':
        setDimensions({ 
          width: '180px', 
          height: '180px', 
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)'
        });
        break;
        
      case 'cap':
        setDimensions({ 
          width: '150px', 
          height: '100px', 
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)'
        });
        break;
        
      default:
        setDimensions({ 
          width: '280px', 
          height: '350px', 
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)'
        });
    }
  }, [productType]);
  
  return (
    <div 
      className={`absolute border-2 border-dashed border-blue-500 ${className || ''}`}
      style={{ 
        width: dimensions.width,
        height: dimensions.height,
        top: dimensions.top,
        left: dimensions.left,
        transform: dimensions.transform,
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      {children}
    </div>
  );
};

export default BoundaryBox;
