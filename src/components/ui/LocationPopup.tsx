
import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';
import { Location } from '@/lib/types';

interface LocationPopupProps {
  onClose: () => void;
}

const LocationPopup: React.FC<LocationPopupProps> = ({ onClose }) => {
  const { locations, currentLocation, setCurrentLocation } = useLocation();

  // Handle location selection
  const handleSelectLocation = (location: Location) => {
    setCurrentLocation(location);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Select Your Location</DialogTitle>
        </DialogHeader>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {locations.map((location) => (
            <Button
              key={location.id}
              variant={currentLocation?.id === location.id ? "default" : "outline"}
              className={`h-16 text-center flex flex-col items-center justify-center ${
                currentLocation?.id === location.id ? 'bg-blue-600' : ''
              }`}
              onClick={() => handleSelectLocation(location)}
            >
              <span className="font-medium">{location.name}</span>
              <span className="text-xs opacity-70">{location.code}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPopup;
