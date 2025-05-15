
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fabric } from 'fabric';
import { ArrowLeft, Undo, Redo, Trash, X, Type, Image as ImageIcon, Smile, Search as SearchIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseClient } from '../hooks/useSupabase';
import { useAuth } from '../context/AuthContext';
import ProductViewer from '../components/design/ProductViewer';
import ProductViewSelector from '../components/design/ProductViewSelector';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import TextModal from '../components/design/TextModal';
import { useLocation } from '../context/LocationContext';
import ImageModal from '../components/design/ImageModal';
import { useCart } from '../context/CartContext';
import { formatIndianRupees } from '@/utils/currency';

// Product interface
interface Product {
  name: string;
  price: number;
  image: string;
}

// Size interface
interface Size {
  name: string;
  quantity: number;
  selected?: boolean;
}

const products: Record<string, Product> = {
  tshirt: { name: 'T-shirt', price: 200, image: '/lovable-uploads/design-tool-page/tshirt-print.png' },
  mug: { name: 'Mug', price: 200, image: '/lovable-uploads/design-tool-page/mug-print.png' },
  cap: { name: 'Cap', price: 150, image: '/lovable-uploads/design-tool-page/cap-print.png' }
};

const DesignTool = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeProduct, setActiveProduct] = useState<string>('tshirt');
  const [productView, setProductView] = useState<string>('front');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, boolean>>({});
  const [emojiSearch, setEmojiSearch] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([]);
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [isDualSided, setIsDualSided] = useState(false);
  const [frontDesign, setFrontDesign] = useState<string | null>(null);
  const [backDesign, setBackDesign] = useState<string | null>(null);
  const [sizeInventory, setSizeInventory] = useState<Record<string, Record<string, number>>>({
    tshirt: { S: 10, M: 15, L: 8, XL: 5 },
    mug: { Standard: 20 },
    cap: { Standard: 12 }
  });
  const [designComplete, setDesignComplete] = useState<Record<string, boolean>>({
    front: false,
    back: false
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useSupabaseClient();
  const { currentUser } = useAuth();
  const { currentLocation } = useLocation();
  const { addToCart } = useCart();

  const sizes: Record<string, Size[]> = {
    tshirt: [
      { name: 'S', quantity: sizeInventory.tshirt.S || 0 },
      { name: 'M', quantity: sizeInventory.tshirt.M || 0 },
      { name: 'L', quantity: sizeInventory.tshirt.L || 0 },
      { name: 'XL', quantity: sizeInventory.tshirt.XL || 0 }
    ],
    mug: [
      { name: 'Standard', quantity: sizeInventory.mug.Standard || 0 }
    ],
    cap: [
      { name: 'Standard', quantity: sizeInventory.cap.Standard || 0 }
    ]
  };

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', 
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', 
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', 
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'
  ];

  useEffect(() => {
    if (params.productCode) {
      if (params.productCode.includes('TSHIRT')) {
        setActiveProduct('tshirt');
      } else if (params.productCode.includes('MUG')) {
        setActiveProduct('mug');
      } else if (params.productCode.includes('CAP')) {
        setActiveProduct('cap');
      }
    }
  }, [params.productCode]);

  // Fetch product inventory on component mount
  useEffect(() => {
    fetchProductInventory();
  }, []);

  const fetchProductInventory = async () => {
    try {
      // Here we'd normally fetch inventory from Supabase or another backend
      // For now, we'll simulate a fetch with our existing data
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'inventory');
      
      if (error) throw error;
      
      // If we have real data, update our local inventory state
      if (data && data.length > 0) {
        const inventoryByProduct: Record<string, Record<string, number>> = {
          tshirt: { S: 0, M: 0, L: 0, XL: 0 },
          mug: { Standard: 0 },
          cap: { Standard: 0 }
        };
        
        data.forEach((item: any) => {
          if (item.product_type && item.size && item.quantity) {
            inventoryByProduct[item.product_type][item.size] = item.quantity;
          }
        });
        
        setSizeInventory(inventoryByProduct);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      toast({
        title: 'Failed to fetch inventory',
        description: 'Could not load current inventory data',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const cleanupCanvas = () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        setCanvas(null);
        setCanvasInitialized(false);
      }
    };

    const initCanvas = () => {
      cleanupCanvas();
      const canvasElement = document.getElementById('design-canvas') as HTMLCanvasElement;
      if (!canvasElement) {
        console.error('Canvas element not found');
        return;
      }
      
      try {
        // Set canvas dimensions based on product type and view
        let canvasWidth = 400;
        let canvasHeight = 400;
        
        if (activeProduct === 'tshirt') {
          canvasWidth = 400;
          canvasHeight = 500;
        } else if (activeProduct === 'mug') {
          canvasWidth = 300;
          canvasHeight = 300;
        } else if (activeProduct === 'cap') {
          canvasWidth = 350;
          canvasHeight = 300;
        }
        
        const fabricCanvas = new fabric.Canvas('design-canvas', {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: '#ffffff'
        });
        
        fabricCanvasRef.current = fabricCanvas;
        setCanvas(fabricCanvas);
        setCanvasInitialized(true);
        
        const initialState = JSON.stringify(fabricCanvas.toJSON());
        setUndoStack([initialState]);
        setRedoStack([]);

        fabricCanvas.on('object:modified', () => {
          saveCanvasState(fabricCanvas);
          updateDesignImage();
          checkDesignStatus();
        });

        fabricCanvas.on('object:added', () => {
          checkDesignStatus();
        });
        
        console.log('Canvas initialized successfully');
      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    };
    
    const timer = setTimeout(() => {
      initCanvas();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      cleanupCanvas();
    };
  }, [activeProduct]);

  useEffect(() => {
    if (canvasInitialized && fabricCanvasRef.current) {
      addProductBackgroundImage(fabricCanvasRef.current, activeProduct, productView);
    }
  }, [activeProduct, productView, canvasInitialized]);

  const addProductBackgroundImage = (canvas: fabric.Canvas, productType: string, view: string) => {
    if (!canvas) {
      console.error('Canvas is not initialized');
      return;
    }
    
    try {
      const designObjects = canvas.getObjects().filter(obj => !obj.data?.isBackground);
      canvas.clear();
      
      let imgSrc = '';
      
      if (productType === 'tshirt') {
        switch (view) {
          case 'front':
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/front.png';
            break;
          case 'back':
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/back.png';
            break;
          case 'left':
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/left.png';
            break;
          case 'right':
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/right.png';
            break;
          default:
            imgSrc = '/lovable-uploads/design-sub-page/tshirt-print.png';
        }
      } else if (productType === 'mug') {
        imgSrc = '/lovable-uploads/design-tool-page/mug-print.png';
      } else if (productType === 'cap') {
        imgSrc = '/lovable-uploads/design-tool-page/cap-print.png';
      }
      
      const img = new Image();
      img.onload = () => {
        fabric.Image.fromURL(imgSrc, (fabricImg) => {
          const scaleFactor = Math.min(
            canvas.getWidth() / fabricImg.width!, 
            canvas.getHeight() / fabricImg.height!
          ) * 0.9;
          
          fabricImg.scale(scaleFactor);
          fabricImg.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            data: { isBackground: true }
          });
          
          canvas.add(fabricImg);
          canvas.sendToBack(fabricImg);
          designObjects.forEach(obj => canvas.add(obj));
          canvas.renderAll();
          updateDesignImage();
          checkDesignStatus();
        });
      };
      
      img.onerror = () => {
        console.error(`Error loading ${imgSrc}`);
        canvas.setBackgroundColor('#f0f0f0', canvas.renderAll.bind(canvas));
        designObjects.forEach(obj => canvas.add(obj));
        canvas.renderAll();
      };
      
      img.src = imgSrc;
      
    } catch (error) {
      console.error('Error adding background image:', error);
    }
  };

  const updateDesignImage = () => {
    if (!canvas) return;
    
    try {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      setDesignImage(dataUrl);
    } catch (error) {
      console.error('Error updating design image:', error);
    }
  };

  useEffect(() => {
    if (!emojiSearch) {
      setFilteredEmojis(emojis);
      return;
    }
    
    const filtered = emojis.filter(emoji => {
      return emoji.includes(emojiSearch);
    });
    
    setFilteredEmojis(filtered.length > 0 ? filtered : emojis);
  }, [emojiSearch]);

  const saveCanvasState = (canvasInstance: fabric.Canvas) => {
    if (!canvasInstance) return;
    
    try {
      const newState = JSON.stringify(canvasInstance.toJSON());
      setUndoStack(prev => [...prev, newState]);
      setRedoStack([]);
      updateDesignImage();
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  };

  const handleProductChange = (productId: string) => {
    if (products[productId]) {
      setActiveProduct(productId);
      setProductView('front');
      setSelectedSizes({});
      setSelectedSize(productId === 'tshirt' ? 'M' : 'Standard');
      setIsDualSided(false);
      setFrontDesign(null);
      setBackDesign(null);
      setDesignComplete({front: false, back: false});
      
      if (canvas) {
        try {
          canvas.clear();
          canvas.backgroundColor = '#ffffff';
          addProductBackgroundImage(canvas, productId, 'front');
          const initialState = JSON.stringify(canvas.toJSON());
          setUndoStack([initialState]);
          setRedoStack([]);
          setDesignImage(undefined);
        } catch (error) {
          console.error('Error handling product change:', error);
        }
      }
    }
  };

  const handleViewChange = (view: string) => {
    if (canvas && isDualSided) {
      if (productView === 'front') {
        const frontDataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
        setFrontDesign(frontDataUrl);
        setDesignComplete(prev => ({...prev, front: hasDesignElements()}));
      } else if (productView === 'back') {
        const backDataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
        setBackDesign(backDataUrl);
        setDesignComplete(prev => ({...prev, back: hasDesignElements()}));
      }
    }
    
    setProductView(view);
    if (canvas && canvasInitialized) {
      addProductBackgroundImage(canvas, activeProduct, view);
      
      setTimeout(() => {
        if (view === 'front' && frontDesign && isDualSided) {
          loadDesignToCanvas(frontDesign);
        } else if (view === 'back' && backDesign && isDualSided) {
          loadDesignToCanvas(backDesign);
        }
      }, 300);
    }
  };

  const loadDesignToCanvas = (designDataUrl: string) => {
    if (!canvas) return;
    
    try {
      fabric.Image.fromURL(designDataUrl, (img) => {
        const backgroundImage = canvas.getObjects().find(obj => obj.data?.isBackground);
        canvas.clear();
        if (backgroundImage) {
          canvas.add(backgroundImage);
          canvas.sendToBack(backgroundImage);
        }
        
        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          selectable: true
        });
        canvas.add(img);
        canvas.renderAll();
        updateDesignImage();
        checkDesignStatus();
      });
    } catch (error) {
      console.error('Error loading design to canvas:', error);
    }
  };

  const handleDualSidedChange = (checked: boolean) => {
    setIsDualSided(checked);
    
    if (checked) {
      if (canvas && productView === 'front') {
        const frontDataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
        setFrontDesign(frontDataUrl);
        setDesignComplete(prev => ({...prev, front: hasDesignElements()}));
      }
      
      toast({
        title: "Dual-sided printing enabled",
        description: "Please design both front and back sides",
      });
      
    } else {
      setFrontDesign(null);
      setBackDesign(null);
      setDesignComplete({front: false, back: false});
    }
  };

  const hasDesignElements = () => {
    if (!canvas) return false;
    
    try {
      // Get all objects except the background
      const designObjects = canvas.getObjects().filter(obj => !obj.data?.isBackground);
      return designObjects.length > 0;
    } catch (error) {
      console.error('Error checking for design elements:', error);
      return false;
    }
  };

  const checkDesignStatus = () => {
    const hasElements = hasDesignElements();
    
    if (isDualSided) {
      if (productView === 'front') {
        setDesignComplete(prev => ({...prev, front: hasElements}));
      } else if (productView === 'back') {
        setDesignComplete(prev => ({...prev, back: hasElements}));
      }
    } else {
      setDesignComplete({front: hasElements, back: false});
    }
  };

  const validateDesign = () => {
    if (!isDualSided) {
      return hasDesignElements();
    }
    
    return designComplete.front && designComplete.back;
  };

  // Modified to mark as an async function
  const updateInventory = async (productType: string, size: string, change: number) => {
    try {
      // In a real app, this would update the Supabase database
      // Since we don't have the product_inventory table in Supabase yet, update local state
      setSizeInventory(prev => ({
        ...prev,
        [productType]: {
          ...prev[productType],
          [size]: prev[productType][size] + change
        }
      }));
      
      return true;
    } catch (err) {
      console.error('Error updating inventory:', err);
      toast({
        title: 'Failed to update inventory',
        description: 'Could not update product quantity',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive"
      });
      navigate('/signin');
      return;
    }

    if (!validateDesign()) {
      if (isDualSided) {
        toast({
          title: "Incomplete design",
          description: "Please add design elements to both front and back sides",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Empty design",
          description: "Please add at least one design element (text, image, or emoji)",
          variant: "destructive"
        });
      }
      return;
    }

    try {
      if (!canvas) return;
      
      // Check inventory
      if (sizeInventory[activeProduct][selectedSize] <= 0) {
        toast({
          title: "Out of stock",
          description: `${products[activeProduct].name} in size ${selectedSize} is currently out of stock`,
          variant: "destructive"
        });
        return;
      }
      
      if (isDualSided && activeProduct === 'tshirt') {
        // Save current side if needed
        if (productView === 'front') {
          setFrontDesign(canvas.toDataURL({ format: 'png', quality: 1 }));
        } else if (productView === 'back') {
          setBackDesign(canvas.toDataURL({ format: 'png', quality: 1 }));
        }
        
        if (!frontDesign || !backDesign) {
          toast({
            title: "Incomplete design",
            description: "Please design both front and back sides for dual-sided printing",
            variant: "destructive"
          });
          return;
        }
        
        const customProduct = {
          id: `custom-${activeProduct}-dual-${Date.now()}`,
          name: `Custom ${products[activeProduct]?.name || 'Product'} (Dual-Sided)`,
          price: 300,
          image: frontDesign,
          productId: `custom-${activeProduct}-dual-${Date.now()}`,
          quantity: 1,
          size: selectedSize,
          view: 'Dual-Sided',
          backImage: backDesign
        };
        
        addToCart(customProduct);
        
        // Update inventory (using a local function that doesn't require await)
        updateInventory(activeProduct, selectedSize, -1)
          .then(success => {
            if (success) {
              toast({
                title: "Added to cart",
                description: "Dual-sided design added to cart successfully"
              });
              
              setTimeout(() => {
                navigate('/cart');
              }, 1000);
            }
          });
        
      } else {
        const designDataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
        
        const customProduct = {
          id: `custom-${activeProduct}-${Date.now()}`,
          name: `Custom ${products[activeProduct]?.name || 'Product'}`,
          price: products[activeProduct]?.price || 200,
          image: designDataUrl,
          productId: `custom-${activeProduct}-${Date.now()}`,
          quantity: 1,
          size: selectedSize,
          view: productView
        };
        
        addToCart(customProduct);
        
        // Update inventory (using a local function that doesn't require await)
        updateInventory(activeProduct, selectedSize, -1)
          .then(success => {
            if (success) {
              toast({
                title: "Added to cart",
                description: "Design added to cart successfully"
              });
              
              setTimeout(() => {
                navigate('/cart');
              }, 1000);
            }
          });
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Failed to add to cart",
        description: "An error occurred while adding the design to cart",
        variant: "destructive"
      });
    }
  };

  const handleUndo = () => {
    if (undoStack.length <= 1 || !canvas) return;
    
    try {
      const currentState = undoStack.pop();
      if (currentState && undoStack.length > 0) {
        setRedoStack([...redoStack, currentState]);
        const prevState = undoStack[undoStack.length - 1];
        canvas.loadFromJSON(JSON.parse(prevState), canvas.renderAll.bind(canvas));
        updateDesignImage();
        checkDesignStatus();
      }
    } catch (error) {
      console.error('Error handling undo:', error);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !canvas) return;
    
    try {
      const stateToRestore = redoStack.pop();
      if (stateToRestore) {
        setUndoStack([...undoStack, stateToRestore]);
        canvas.loadFromJSON(JSON.parse(stateToRestore), canvas.renderAll.bind(canvas));
        updateDesignImage();
        checkDesignStatus();
      }
    } catch (error) {
      console.error('Error handling redo:', error);
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;
    
    try {
      // Keep only background object
      const backgroundObject = canvas.getObjects().find(obj => obj.data?.isBackground);
      canvas.clear();
      
      if (backgroundObject) {
        canvas.add(backgroundObject);
        canvas.sendToBack(backgroundObject);
      }
      
      canvas.renderAll();
      saveCanvasState(canvas);
      updateDesignImage();
      checkDesignStatus();
      
      // Reset dual-sided designs if needed
      if (isDualSided) {
        if (productView === 'front') {
          setFrontDesign(null);
          setDesignComplete(prev => ({...prev, front: false}));
        } else if (productView === 'back') {
          setBackDesign(null);
          setDesignComplete(prev => ({...prev, back: false}));
        }
      }
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  };

  const removeSelectedObject = () => {
    if (!canvas) return;
    
    try {
      const activeObject = canvas.getActiveObject();
      if (activeObject && !activeObject.data?.isBackground) {
        canvas.remove(activeObject);
        canvas.renderAll();
        saveCanvasState(canvas);
        updateDesignImage();
        checkDesignStatus();
      }
    } catch (error) {
      console.error('Error removing selected object:', error);
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const saveDesign = async () => {
    if (!canvas || !currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your design",
        variant: "destructive"
      });
      navigate('/signin');
      return;
    }

    try {
      const designDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      
      // Save to browser storage for now (could be replaced with actual database storage later)
      localStorage.setItem(`design-${Date.now()}`, designDataUrl);
      
      toast({
        title: "Design saved",
        description: "Your design has been saved successfully"
      });
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: "Save failed",
        description: "Failed to save your design",
        variant: "destructive"
      });
    }
  };

  const addTextToCanvas = (text: string, color: string, font: string) => {
    if (!canvas) return;
    
    try {
      const textObj = new fabric.Text(text, {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        fontFamily: font,
        fill: color,
        fontSize: 30,
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
      saveCanvasState(canvas);
      updateDesignImage();
      checkDesignStatus();
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  const handleAddImage = (imageUrl: string) => {
    if (!canvas) return;
    
    try {
      fabric.Image.fromURL(imageUrl, (img) => {
        // Scale image to fit within canvas
        const scaleFactor = Math.min(
          (canvas.width! * 0.5) / img.width!,
          (canvas.height! * 0.5) / img.height!
        );
        
        img.scale(scaleFactor);
        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveCanvasState(canvas);
        updateDesignImage();
        checkDesignStatus();
      });
    } catch (error) {
      console.error('Error adding image:', error);
    }
  };

  const addEmojiToCanvas = (emoji: string) => {
    if (!canvas) return;
    
    try {
      const text = new fabric.Text(emoji, {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        fontSize: 60,
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      saveCanvasState(canvas);
      updateDesignImage();
      checkDesignStatus();
      setIsEmojiModalOpen(false);
    } catch (error) {
      console.error('Error adding emoji:', error);
    }
  };

  return (
    <Layout>
      <div className="container-custom px-4">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-1" size={20} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Design Your Product</h1>
          <div className="w-20"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 pt-0 mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Product</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(products).map(([id, product]) => (
              <button
                key={id}
                onClick={() => handleProductChange(id)}
                className={`flex flex-col items-center p-3 rounded-md border ${
                  activeProduct === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-contain" />
                </div>
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-xs text-green-600">{formatIndianRupees(isDualSided && id === 'tshirt' ? 300 : product.price)}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 ">
              <div className="flex items-center justify-between ">
                <h2 className="text-lg font-semibold">Design Canvas</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUndo}
                    disabled={undoStack.length <= 1}
                    className={`p-2 rounded-md ${
                      undoStack.length <= 1 ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    }`}
                    title="Undo"
                  >
                    <Undo size={20} />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className={`p-2 rounded-md ${
                      redoStack.length === 0 ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    }`}
                    title="Redo"
                  >
                    <Redo size={20} />
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="p-2 rounded-md text-red-600 bg-red-50 hover:bg-red-100"
                    title="Clear Canvas"
                  >
                    <Trash size={20} />
                  </button>
                  <button
                    onClick={removeSelectedObject}
                    className="p-2 rounded-md text-red-600 bg-red-50 hover:bg-red-100"
                    title="Remove Selected Object"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center mt-4" style={{ height: activeProduct === 'tshirt' ? '500px' : activeProduct === 'mug' ? '300px' : '300px', width: '100%' }}>
                <canvas id="design-canvas" ref={canvasRef}></canvas>
              </div>
              
              {isDualSided && activeProduct === 'tshirt' && (
                <div className="mt-2 text-center">
                  <span className="text-blue-600 font-medium">
                    Currently designing: {productView === 'front' ? 'Front Side' : 'Back Side'}
                    {productView === 'front' && designComplete.front && ' ✅'}
                    {productView === 'back' && designComplete.back && ' ✅'}
                  </span>
                </div>
              )}
              
              {/* Design guidance and status */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-700">Design Status:</h3>
                <ul className="text-sm text-blue-600 mt-1">
                  {isDualSided ? (
                    <>
                      <li className="flex items-center">
                        <span className={`mr-1 ${designComplete.front ? 'text-green-500' : 'text-gray-400'}`}>
                          {designComplete.front ? '✓' : '○'}
                        </span>
                        Front design {designComplete.front ? 'complete' : 'incomplete'}
                      </li>
                      <li className="flex items-center">
                        <span className={`mr-1 ${designComplete.back ? 'text-green-500' : 'text-gray-400'}`}>
                          {designComplete.back ? '✓' : '○'}
                        </span>
                        Back design {designComplete.back ? 'complete' : 'incomplete'}
                      </li>
                    </>
                  ) : (
                    <li className="flex items-center">
                      <span className={`mr-1 ${designComplete.front ? 'text-green-500' : 'text-gray-400'}`}>
                        {designComplete.front ? '✓' : '○'}
                      </span>
                      Design {designComplete.front ? 'complete' : 'incomplete'}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-20">
              <ProductViewSelector 
                productType={activeProduct}
                currentView={productView}
                onViewChange={handleViewChange}
                selectedSize={selectedSize}
                onSizeChange={handleSizeChange}
                isDualSided={isDualSided}
                onDualSidedChange={activeProduct === 'tshirt' ? handleDualSidedChange : undefined}
              />
              
              {/* Available stock info */}
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Available stock: <span className="font-medium">{sizeInventory[activeProduct][selectedSize] || 0}</span> items
                </p>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">Customization Options</h2>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setIsTextModalOpen(true)}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <Type size={24} className="mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Add Text</span>
                  </button>
                  
                  <button 
                    onClick={() => setIsImageModalOpen(true)}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <ImageIcon size={24} className="mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Add Image</span>
                  </button>
                  
                  <button 
                    onClick={() => setIsEmojiModalOpen(true)}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <Smile size={24} className="mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Add Emoji</span>
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between mb-4">
                  <h2 className="text-lg font-semibold">Product Details</h2>
                  <div className="font-bold text-green-600">
                    {formatIndianRupees(isDualSided && activeProduct === 'tshirt' ? 300 : products[activeProduct]?.price)}
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={saveDesign}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Design
                  </button>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={!validateDesign() || sizeInventory[activeProduct][selectedSize] <= 0}
                    className={`flex-1 px-4 py-2 text-white rounded-md ${
                      !validateDesign() || sizeInventory[activeProduct][selectedSize] <= 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Add to Cart
                  </button>
                </div>
                
                {/* Error messages */}
                {!validateDesign() && (
                  <p className="mt-2 text-sm text-red-500">
                    {isDualSided 
                      ? "Please complete both front and back designs"
                      : "Please add some design elements"
                    }
                  </p>
                )}
                {sizeInventory[activeProduct][selectedSize] <= 0 && (
                  <p className="mt-2 text-sm text-red-500">
                    This size is currently out of stock
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <TextModal 
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onAddText={addTextToCanvas}
      />
      
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onAddImage={handleAddImage}
      />
      
      <Dialog open={isEmojiModalOpen} onOpenChange={setIsEmojiModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Emoji</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="relative mb-4">
              <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search emoji"
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                className="w-full pl-10 p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmojiToCanvas(emoji)}
                  className="text-2xl p-2 border border-transparent hover:border-gray-300 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DesignTool;
