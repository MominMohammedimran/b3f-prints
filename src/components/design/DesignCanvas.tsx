import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useColor } from '@/context/ColorContext';
import { useFont } from '@/context/FontContext';
import { useImage } from '@/context/ImageContext';
import { useText } from '@/context/TextContext';
import { useEmoji } from '@/context/EmojiContext';
import BoundaryRestrictor from './BoundaryRestrictor';

const DesignCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const { selectedColor } = useColor();
  const { selectedFont } = useFont();
  const { selectedImage } = useImage();
  const { text, setText } = useText();
  const { selectedEmoji } = useEmoji();

  useEffect(() => {
    const initializeCanvas = () => {
      const newCanvas = new fabric.Canvas('design-canvas', {
        backgroundColor: '#fff',
        height: 500,
        width: 500,
        preserveObjectStacking: true,
        selection: true,
        renderOnAddRemove: true,
      });

      setCanvas(newCanvas);
    };

    initializeCanvas();

    return () => {
      canvas?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    const addTextToCanvas = () => {
      if (!text) return;

      const textbox = new fabric.Textbox(text, {
        left: 100,
        top: 100,
        fontSize: 20,
        fontFamily: selectedFont,
        fill: selectedColor,
        hasRotatingPoint: true,
        centerTransform: true,
        data: {
          type: 'text',
        },
      });

      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      canvas.renderAll();
      setText('');
    };

    addTextToCanvas();
  }, [text, selectedFont, selectedColor, canvas, setText]);

  useEffect(() => {
    if (!canvas || !selectedImage) return;

    const addImageToCanvas = (url: string) => {
      fabric.Image.fromURL(url, (img) => {
        img.set({
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
          hasRotatingPoint: true,
          centerTransform: true,
          data: {
            type: 'image',
          },
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };

    addImageToCanvas(selectedImage);
  }, [selectedImage, canvas]);

  useEffect(() => {
    if (!canvas || !selectedEmoji) return;

    const addEmojiToCanvas = (url: string) => {
      fabric.Image.fromURL(url, (img) => {
        img.set({
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
          hasRotatingPoint: true,
          centerTransform: true,
          data: {
            type: 'emoji',
          },
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };

    addEmojiToCanvas(selectedEmoji);
  }, [selectedEmoji, canvas]);

  return (
    <div className="design-canvas-container relative">
      <canvas
        id="design-canvas"
        ref={canvasRef}
        className="border border-gray-300"
      />
      <div 
        id="design-boundary" 
        className="absolute border-2 border-dashed border-blue-500 pointer-events-none"
        style={{
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          zIndex: 10
        }}
      />
      <BoundaryRestrictor canvas={canvasRef.current} boundaryId="design-boundary" />
    </div>
  );
};

export default DesignCanvas;
