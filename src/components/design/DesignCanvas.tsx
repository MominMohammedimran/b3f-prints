
import React, { useEffect } from 'react';
import { fabric } from 'fabric';
import BoundaryBox from '../customization/BoundaryBox';

interface DesignCanvasProps {
  activeProduct: string;
  productView: string;
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  undoStack: string[];
  redoStack: string[];
  setUndoStack: (stack: string[]) => void;
  setRedoStack: (stack: string[]) => void;
  setDesignImage: (image: string | undefined) => void;
  setCanvasInitialized: (value: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef: React.RefObject<fabric.Canvas | null>;
  designComplete: Record<string, boolean>;
  setDesignComplete: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkDesignStatus: (canvas?: fabric.Canvas | null) => boolean;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  activeProduct,
  productView,
  canvas,
  setCanvas,
  undoStack,
  redoStack,
  setUndoStack,
  setRedoStack,
  setDesignImage,
  setCanvasInitialized,
  canvasRef,
  fabricCanvasRef,
  designComplete,
  setDesignComplete,
  checkDesignStatus
}) => {
  // Undo functionality
  const handleUndo = () => {
    if (undoStack.length <= 1 || !canvas) return;
    
    try {
      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];
      
      setRedoStack([...redoStack, currentState]);
      setUndoStack(undoStack.slice(0, -1));
      
      canvas.loadFromJSON(previousState, canvas.renderAll.bind(canvas));
      setDesignImage(canvas.toDataURL({ format: 'png' }));
    } catch (error) {
      console.error('Error during undo:', error);
    }
  };
  
  // Redo functionality
  const handleRedo = () => {
    if (redoStack.length === 0 || !canvas) return;
    
    try {
      const nextState = redoStack[redoStack.length - 1];
      
      setUndoStack([...undoStack, nextState]);
      setRedoStack(redoStack.slice(0, -1));
      
      canvas.loadFromJSON(nextState, canvas.renderAll.bind(canvas));
      setDesignImage(canvas.toDataURL({ format: 'png' }));
    } catch (error) {
      console.error('Error during redo:', error);
    }
  };
  
  // Render the right product image based on the selected type and view
  const renderProductImage = () => {
    let imageSrc = '';
    
    switch (activeProduct) {
      case 'tshirt':
        switch (productView) {
          case 'front':
            imageSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/front.png';
            break;
          case 'back':
            imageSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/back.png';
            break;
          default:
            imageSrc = '/lovable-uploads/design-tool-page/tshirt-print.png';
        }
        break;
      case 'mug':
        imageSrc = '/lovable-uploads/design-tool-page/mug-print.png';
        break;
      case 'cap':
        imageSrc = '/lovable-uploads/design-tool-page/cap-print.png';
        break;
      default:
        imageSrc = '/lovable-uploads/design-tool-page/tshirt-print.png';
    }
    
    return imageSrc;
  };
  
  // Function to enforce objects stay within boundary
  const enforceBoundary = (obj: fabric.Object) => {
    if (!canvas) return;
    
    // Get boundary constraints based on product type
    const boundaryConstraints = getBoundaryConstraints();
    
    // Calculate scaled object dimensions
    const objWidth = obj.getScaledWidth();
    const objHeight = obj.getScaledHeight();
    
    // Get object position
    const objLeft = obj.left || 0;
    const objTop = obj.top || 0;
    
    // Enforce horizontal constraints
    if (objLeft < boundaryConstraints.left) {
      obj.set('left', boundaryConstraints.left);
    } else if (objLeft + objWidth > boundaryConstraints.left + boundaryConstraints.width) {
      obj.set('left', boundaryConstraints.left + boundaryConstraints.width - objWidth);
    }
    
    // Enforce vertical constraints
    if (objTop < boundaryConstraints.top) {
      obj.set('top', boundaryConstraints.top);
    } else if (objTop + objHeight > boundaryConstraints.top + boundaryConstraints.height) {
      obj.set('top', boundaryConstraints.top + boundaryConstraints.height - objHeight);
    }
    
    obj.setCoords();
    canvas.renderAll();
  };
  
  // Get boundary constraints based on product type
  const getBoundaryConstraints = () => {
    // Default constraints for tshirt front
    let constraints = {
      left: 175,
      top: 120,
      width: 150,
      height: 200
    };
    
    switch (activeProduct) {
      case 'tshirt':
        if (productView === 'front') {
          constraints = {
            left: 175,
            top: 120,
            width: 150,
            height: 200
          };
        } else if (productView === 'back') {
          constraints = {
            left: 175,
            top: 120,
            width: 150,
            height: 200
          };
        }
        break;
      case 'mug':
        constraints = {
          left: 150,
          top: 100,
          width: 100,
          height: 150
        };
        break;
      case 'cap':
        constraints = {
          left: 150,
          top: 100,
          width: 120,
          height: 80
        };
        break;
    }
    
    return constraints;
  };
  
  // Set keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undoStack, redoStack, canvas]);
  
  // Setup canvas event listeners to enforce boundary
  useEffect(() => {
    if (!canvas) return;
    
    const handleObjectMoving = (e: fabric.IEvent) => {
      const obj = e.target;
      if (obj) {
        enforceBoundary(obj);
      }
    };
    
    const handleObjectScaling = (e: fabric.IEvent) => {
      const obj = e.target;
      if (obj) {
        enforceBoundary(obj);
      }
    };
    
    const handleObjectModified = (e: fabric.IEvent) => {
      // Save state for undo/redo after an object is modified
      if (canvas) {
        const jsonState = JSON.stringify(canvas.toJSON());
        setUndoStack([...undoStack, jsonState]);
        setRedoStack([]);
        
        // Update design image
        setDesignImage(canvas.toDataURL({ format: 'png' }));
        
        // Check and update design completion status
        const isComplete = checkDesignStatus(canvas);
        setDesignComplete({
          ...designComplete,
          [activeProduct + '-' + productView]: isComplete
        });
      }
    };
    
    // Add event listeners
    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:scaling', handleObjectScaling);
    canvas.on('object:modified', handleObjectModified);
    
    return () => {
      // Remove event listeners on cleanup
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:scaling', handleObjectScaling);
      canvas.off('object:modified', handleObjectModified);
    };
  }, [canvas, activeProduct, productView, undoStack, redoStack]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative mb-6">
      <div className="relative flex justify-center overflow-hidden">
        {/* Product image */}
        <img
          src={renderProductImage()}
          alt={`${activeProduct} ${productView} view`}
          className="max-h-[500px] object-contain"
        />
        
        {/* Design boundary box */}
        <BoundaryBox productType={activeProduct} view={productView} />
        
        {/* Canvas for designing */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-0">
          <canvas 
            id="design-canvas" 
            ref={canvasRef}
            className="absolute z-0"
          />
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="mt-4 flex items-center justify-center space-x-2">
        <button
          onClick={handleUndo}
          disabled={undoStack.length <= 1}
          className={`px-4 py-2 rounded-md ${
            undoStack.length <= 1 
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className={`px-4 py-2 rounded-md ${
            redoStack.length === 0
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Redo
        </button>
      </div>
    </div>
  );
};

export default DesignCanvas;
