
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FontContextType {
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  availableFonts: string[];
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const availableFonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact'];

  return (
    <FontContext.Provider value={{ selectedFont, setSelectedFont, availableFonts }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = (): FontContextType => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};
