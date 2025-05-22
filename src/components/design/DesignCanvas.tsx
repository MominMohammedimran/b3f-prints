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
        <BoundaryBox productType={activeProduct} />
        
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
